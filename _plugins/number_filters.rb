# frozen_string_literal: true

# Liquid number-formatting filters for OpenSolano.
#
# Jekyll/Liquid has no built-in thousands separator, but civic-data pages show
# a lot of dollar figures and counts that should read cleanly. These filters
# provide that one place rather than per-page string hacks.
#
# Usage in templates:
#   {{ 150575 | number_with_delimiter }}        -> "150,575"
#   {{ 45629.4 | number_with_delimiter }}        -> "45,629"  (rounded, no decimals)
#   {{ 1234.5 | number_with_delimiter: ",", 1 }} -> "1,234.5"

module NumberFilters
  # Format a number with a thousands delimiter. Rounds to `precision`
  # decimal places (default 0 — whole numbers, no decimal point).
  def number_with_delimiter(input, delimiter = ",", precision = 0)
    return input if input.nil? || input.to_s.strip.empty?

    number = Float(input) rescue (return input)
    rounded = number.round(precision.to_i)

    if precision.to_i <= 0
      int = rounded.to_i.abs.to_s.reverse.gsub(/(\d{3})(?=\d)/, "\\1#{delimiter}").reverse
      (rounded.negative? ? "-" : "") + int
    else
      whole, frac = format("%.#{precision.to_i}f", rounded).split(".")
      sign = whole.start_with?("-") ? "-" : ""
      whole = whole.delete("-")
      whole = whole.reverse.gsub(/(\d{3})(?=\d)/, "\\1#{delimiter}").reverse
      "#{sign}#{whole}.#{frac}"
    end
  end
end

Liquid::Template.register_filter(NumberFilters)
