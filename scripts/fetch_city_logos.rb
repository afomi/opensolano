#!/usr/bin/env ruby
# frozen_string_literal: true

# Fetches SVG city logos (or seals/coat of arms if no logo) from Wikidata/Wikipedia
# and saves them into assets/images/<slug>-logo.svg
#
# Usage:
#   ruby scripts/fetch_city_logos.rb               # fetch all known Solano cities
#   ruby scripts/fetch_city_logos.rb vacaville     # fetch a specific city by slug
#   ruby scripts/fetch_city_logos.rb vallejo dixon # fetch multiple slugs
#
# Notes:
# - Prioritizes Wikidata properties: logo image (P154) → seal image (P158) → coat of arms (P94) → flag image (P41) → image (P18)
# - Only saves files that are SVG by default. Pass --allow-non-svg to accept PNG/GIF/WebP.
# - Requires network access.

require 'json'
require 'net/http'
require 'uri'
require 'fileutils'

WIKIDATA_API = URI('https://www.wikidata.org/w/api.php')
COMMONS_API  = URI('https://commons.wikimedia.org/w/api.php')

City = Struct.new(:slug, :name)

CITIES = [
  City.new('benicia', 'Benicia, California'),
  City.new('dixon', 'Dixon, California'),
  City.new('fairfield', 'Fairfield, California'),
  City.new('riovista', 'Rio Vista, California'),
  City.new('suisun-city', 'Suisun City, California'),
  City.new('vacaville', 'Vacaville, California'),
  City.new('vallejo', 'Vallejo, California')
].freeze

# Wikidata image properties ordered by preference
IMAGE_PROPS = %w[P154 P158 P94 P41 P18].freeze

def http_get(uri, params)
  u = uri.dup
  u.query = URI.encode_www_form(params)
  res = Net::HTTP.start(u.host, u.port, use_ssl: u.scheme == 'https') do |http|
    req = Net::HTTP::Get.new(u)
    http.request(req)
  end
  raise "HTTP #{res.code} #{res.message} for #{u}" unless res.is_a?(Net::HTTPSuccess)
  res.body
end

def wikidata_search_item(title)
  json = http_get(WIKIDATA_API, {
    action: 'wbsearchentities',
    search: title,
    language: 'en',
    uselang: 'en',
    type: 'item',
    format: 'json',
    limit: 5
  })
  data = JSON.parse(json)
  return nil if data['search'].nil? || data['search'].empty?

  # Prefer entries that look like cities in California
  entry = data['search'].find { |s| (s['description'] || '').downcase.include?('city in california') } || data['search'].first
  entry && entry['id'] # returns Q-id
end

def wikidata_get_image_filename(qid)
  json = http_get(WIKIDATA_API, {
    action: 'wbgetentities',
    ids: qid,
    props: 'claims',
    format: 'json'
  })
  data = JSON.parse(json)
  entity = data.dig('entities', qid)
  return nil unless entity
  claims = entity['claims'] || {}

  IMAGE_PROPS.each do |prop|
    next unless claims[prop]
    claim = claims[prop].find { |c| c.dig('mainsnak', 'datavalue', 'value') }
    next unless claim
    value = claim.dig('mainsnak', 'datavalue', 'value')
    filename = if value.is_a?(Hash) && value['entity-type'] == 'item'
                 # Some properties might point to another item; skip
                 nil
               else
                 value
               end
    return filename if filename
  end
  nil
end

def commons_get_original_url(filename)
  # filename should be like "File:Seal of ... .svg"; ensure prefix
  title = filename.start_with?('File:') ? filename : "File:#{filename}"
  json = http_get(COMMONS_API, {
    action: 'query',
    titles: title,
    prop: 'imageinfo',
    iiprop: 'url',
    format: 'json'
  })
  data = JSON.parse(json)
  page = data.dig('query', 'pages')&.values&.first
  return nil unless page
  info = page['imageinfo']&.first
  info && info['url']
end

def fetch_logo_for(city, allow_non_svg: false)
  puts "\n==> #{city.name} (#{city.slug})"
  qid = wikidata_search_item(city.name)
  unless qid
    puts "  !! Wikidata item not found"
    return :not_found
  end
  puts "  - Wikidata: #{qid}"

  filename = wikidata_get_image_filename(qid)
  unless filename
    puts "  !! No image filename found in preferred properties (#{IMAGE_PROPS.join(', ')})"
    return :no_image
  end
  puts "  - Commons file: #{filename}"

  url = commons_get_original_url(filename)
  unless url
    puts "  !! Could not resolve original image URL"
    return :no_url
  end
  puts "  - Original URL: #{url}"

  out_dir = File.join(__dir__, '..', 'assets', 'images')
  FileUtils.mkdir_p(out_dir)

  if url.downcase.end_with?('.svg')
    out_path = File.expand_path(File.join(out_dir, "#{city.slug}-logo.svg"))
    uri = URI(url)
    data = Net::HTTP.get(uri)
    File.write(out_path, data)
    puts "  ✓ Saved: #{out_path}"
    return :saved
  end

  unless allow_non_svg
    puts "  !! Skipping non-SVG asset (wanted .svg). Use --allow-non-svg to save anyway."
    return :non_svg
  end

  ext = File.extname(URI(url).path)
  ext = '.png' if ext.nil? || ext.empty?
  ext = ext.downcase
  out_path = File.expand_path(File.join(out_dir, "#{city.slug}-logo#{ext}"))
  data = Net::HTTP.get(URI(url))
  File.write(out_path, data)
  puts "  ✓ Saved non-SVG: #{out_path}"
  :saved_non_svg
rescue => e
  puts "  !! Error: #{e.class}: #{e.message}"
  :error
end

def main
  args = ARGV.dup
  allow_non_svg = false
  args.delete_if do |a|
    case a
    when '--allow-non-svg'
      allow_non_svg = true
      true
    else
      false
    end
  end

  allow_non_svg ||= ENV['ALLOW_NON_SVG'] == '1'

  slugs = args
  selected = if slugs.empty?
               CITIES
             else
               set = slugs.map(&:strip).to_set
               CITIES.select { |c| set.include?(c.slug) }
             end

  if selected.empty?
    warn 'No matching cities for given slugs.'
    exit 1
  end

  results = {}
  selected.each do |city|
    results[city.slug] = fetch_logo_for(city, allow_non_svg: allow_non_svg)
  end

  puts "\nSummary:"
  results.each do |slug, status|
    puts "  - #{slug}: #{status}"
  end
  puts "\nNext: update _data/solano_cities.yml logos, e.g.:"
  selected.each do |city|
    puts "    - slug: #{city.slug}\n      logo: /assets/images/#{city.slug}-logo.svg"
  end
end

require 'set'
main if $PROGRAM_NAME == __FILE__
