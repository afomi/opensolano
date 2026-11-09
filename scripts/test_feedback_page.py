#!/usr/bin/env python3
"""Checks for the unofficial park feedback page (/feedback).

Data checks (always run):
  * every slug printed on the 41 park signs resolves to exactly one park with
    a [lat, lng] center, across _data/vacaville_parks.yml + _data/park_feedback.yml
  * no duplicate slugs
  * a submission path is configured (endpoint or mailto)

Build checks (run when _site/feedback.html exists; build with
`npm run build:css && bundle exec jekyll build` first):
  * the disclaimer text is on the page
  * every sign slug appears as a park option
  * the page loads assets/js/park-feedback.js

Every check prints an explicit OK line; any failure exits non-zero.

Usage:
    python3 scripts/test_feedback_page.py
"""

import os
import re
import sys

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARKS_YML = os.path.join(ROOT, "_data", "vacaville_parks.yml")
FEEDBACK_YML = os.path.join(ROOT, "_data", "park_feedback.yml")
BUILT_PAGE = os.path.join(ROOT, "_site", "feedback.html")

# The 41 slugs on the printed signs.
# Source: ~/workspace/parks-commission/feedback-signs/out/urls.csv (2026-08-16).
SIGN_SLUGS = [
    "alamo-creek-park", "andrews-park", "arbor-oaks-park", "arlington-park",
    "brighton-landing-park", "browns-valley-park", "cambridge-park",
    "cannon-station-park", "centennial-park", "city-hall-park",
    "cooper-school-park", "corderos-park", "fairmont-beelard-park",
    "hawkins-park", "hemlock-park", "hume-grove-park", "keating-park",
    "lagoon-valley-park", "larsen-park", "little-oak-park",
    "lower-lagoon-valley-park", "southtown-magnolia-park", "meadowlands-park",
    "nelson-park", "normandy-meadows-park", "north-orchard-park", "padan-park",
    "patch-park", "patwin-park", "pena-adobe-park", "pheasant-country-park",
    "pocket-park", "ridgeview-park", "sierra-vista-park",
    "southtown-pocket-park", "southtown-pocket-park-2", "southwood-park",
    "stonegate-park", "three-oaks-park", "trower-park", "willows-park",
]

failures = []


def ok(msg):
    print("OK:", msg)


def fail(msg):
    failures.append(msg)
    print("FAIL:", msg)


def load(path):
    with open(path) as f:
        return yaml.safe_load(f)


def main():
    assert len(SIGN_SLUGS) == 41, "fixture drifted"
    parks_data = load(PARKS_YML)
    feedback = load(FEEDBACK_YML)
    parks = list(parks_data["parks"]) + list(feedback.get("extra_parks") or [])

    slugs = [p["slug"] for p in parks]
    dupes = sorted({s for s in slugs if slugs.count(s) > 1})
    if dupes:
        fail("duplicate park slugs: %s" % dupes)
    else:
        ok("%d parks, no duplicate slugs" % len(parks))

    by_slug = {p["slug"]: p for p in parks}
    missing = [s for s in SIGN_SLUGS if s not in by_slug]
    if missing:
        fail("sign slugs with no park entry: %s" % missing)
    else:
        ok("all 41 sign slugs resolve to a park")

    bad_center = []
    for s in SIGN_SLUGS:
        c = by_slug.get(s, {}).get("center")
        if not (isinstance(c, list) and len(c) == 2 and all(isinstance(x, (int, float)) for x in c)):
            bad_center.append(s)
        elif not (38.2 < c[0] < 38.5 and -122.2 < c[1] < -121.8):
            bad_center.append("%s (outside Vacaville bbox: %s)" % (s, c))
    if bad_center:
        fail("parks without a usable center: %s" % bad_center)
    else:
        ok("all 41 sign parks have a [lat, lng] center inside the Vacaville bounding box")

    endpoint = (feedback.get("endpoint") or "").strip()
    mailto = (feedback.get("mailto") or "").strip()
    if endpoint:
        if not re.fullmatch(r"https://touchpoints\.app/api/forms/[0-9a-f-]{36}/submit", endpoint):
            fail("endpoint is not a Touchpoints form submit URL: %s" % endpoint)
        fields = feedback.get("fields") or {}
        missing = [k for k in ("park", "category", "message", "contact", "source", "page_url") if not fields.get(k)]
        if missing:
            fail("endpoint is set but fields has no question id for: %s" % ", ".join(missing))
        ok("submission path: endpoint %s" % endpoint)
    elif "@" in mailto:
        ok("submission path: mailto fallback to %s (no endpoint configured)" % mailto)
    else:
        fail("no submission path: set endpoint or mailto in _data/park_feedback.yml")

    if not feedback.get("disclaimer", "").startswith("This is not an official City of Vacaville service"):
        fail("disclaimer text changed or missing in _data/park_feedback.yml")
    else:
        ok("disclaimer text present in data")

    if os.path.exists(BUILT_PAGE):
        html = open(BUILT_PAGE, encoding="utf-8").read()
        if feedback["disclaimer"] in html:
            ok("built page shows the disclaimer")
        else:
            fail("built page is missing the disclaimer")
        absent = [s for s in SIGN_SLUGS if 'data-slug="%s"' % s not in html]
        if absent:
            fail("built page lacks options for: %s" % absent)
        else:
            ok("built page has a picker option for all 41 sign slugs")
        if "/assets/js/park-feedback.js" in html:
            ok("built page loads park-feedback.js")
        else:
            fail("built page does not load park-feedback.js")
        if "ParkFeedback.init(" in html and '"little-oak-park"' in html:
            ok("built page embeds park data for ParkFeedback.init")
        else:
            fail("built page does not embed park data")
    else:
        print("SKIP: %s not built; run `npm run build:css && bundle exec jekyll build` for page checks" % BUILT_PAGE)

    if failures:
        print("\n%d check(s) FAILED" % len(failures))
        sys.exit(1)
    print("\nAll feedback page checks passed")


if __name__ == "__main__":
    main()
