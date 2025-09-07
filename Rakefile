require 'rake'

desc 'Fetch city logos (SVG only by default). Usage: rake logos[slugs] or LOGOS=vacaville,vallejo rake logos'
task :logos, [:slugs] do |_t, args|
  slugs = (ENV['LOGOS'] || args[:slugs] || '').split(',').map(&:strip).reject(&:empty?)
  cmd = ['ruby', File.join('scripts', 'fetch_city_logos.rb')] + slugs
  puts "Running: #{cmd.join(' ')}"
  sh(*cmd)
end

desc 'Fetch city logos allowing non-SVG (PNG/GIF/WebP) if SVG not available'
task :logos_any, [:slugs] do |_t, args|
  slugs = (ENV['LOGOS'] || args[:slugs] || '').split(',').map(&:strip).reject(&:empty?)
  cmd = ['ruby', File.join('scripts', 'fetch_city_logos.rb'), '--allow-non-svg'] + slugs
  puts "Running: #{cmd.join(' ')}"
  sh(*cmd)
end

task default: :logos

