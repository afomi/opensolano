# frozen_string_literal: true

# Compile Tailwind CSS during local development, as part of `jekyll serve`.
#
# Why this exists: CSS is compiled by @tailwindcss/cli (`npm run build:css`),
# NOT by Jekyll. During local dev, running Jekyll alone silently serves stale
# CSS — new utility classes render without styles. This plugin closes that gap
# by recompiling the CSS before Jekyll reads/writes files, so editing HTML and
# refreshing "just works" without a separate terminal running `watch:css`.
#
# DEV ONLY: this is intentionally scoped to non-production. Production builds
# (JEKYLL_ENV=production — what CI sets) skip it entirely; CI runs
# `npm run build:css` as its own explicit, minified step. Keeping the prod CSS
# build outside Jekyll keeps deploys deterministic and avoids relying on `npx`
# being available in the deploy environment.
#
# It shells out to the same @tailwindcss/cli invocation as the npm scripts, so
# there is one source of truth for how CSS is built (package.json -> build:css).
#
# Behavior:
#   - Runs at site `:after_init`, before generation, on each (re)build.
#   - Skips when JEKYLL_ENV=production.
#   - Fails the build loudly if compilation errors, so a broken stylesheet is
#     obvious immediately rather than silently served.

require "open3"

module TailwindBuild
  CSS_INPUT = "_css/main.css"
  CSS_OUTPUT = "assets/css/main.css"

  # Readable (un-minified) output for dev; production is handled outside Jekyll.
  def self.command
    ["npx", "@tailwindcss/cli", "-i", "./#{CSS_INPUT}", "-o", "./#{CSS_OUTPUT}"]
  end

  # Dev only: production CSS is built outside Jekyll (CI `npm run build:css`).
  def self.skip?
    ENV["JEKYLL_ENV"] == "production"
  end

  def self.run!(site)
    return if skip?

    source = site.source
    input = File.join(source, CSS_INPUT)
    unless File.exist?(input)
      Jekyll.logger.warn "Tailwind:", "#{CSS_INPUT} not found; skipping CSS build"
      return
    end

    Jekyll.logger.info "Tailwind:", "compiling #{CSS_INPUT} -> #{CSS_OUTPUT}"
    stdout, stderr, status = Open3.capture3(*command, chdir: source)

    unless status.success?
      Jekyll.logger.error "Tailwind:", "CSS build failed"
      Jekyll.logger.error "Tailwind:", stderr.strip unless stderr.strip.empty?
      raise "Tailwind CSS build failed (exit #{status.exitstatus}). " \
            "Run `npm run build:css` to debug."
    end

    # @tailwindcss/cli prints its status banner to stderr even on success.
    banner = stderr.strip
    Jekyll.logger.info "Tailwind:", banner.lines.last.strip unless banner.empty?
  end
end

Jekyll::Hooks.register :site, :after_init do |site|
  TailwindBuild.run!(site)
end
