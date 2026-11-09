# Park feedback page — `/feedback`

The page the 41 printed park signs point to
(`opensolano.org/feedback`, a typed address with no QR code). Unofficial, 311-like intake for
Vacaville parks, run by Ryan as a private citizen. Signs live in
`~/workspace/parks-commission/feedback-signs/`.

## Guardrails (non-negotiable)

1. **Not an official City service.** The disclaimer in `_data/park_feedback.yml`
   is rendered at the top of the page and beside the submit button. Do not soften it.
2. **Never auto-distribute to Parks & Recreation Commissioners.** Submissions go to
   one inbox Ryan reads. Forwarding happens by hand, through public channels
   (staff, public comment). Sending to commissioners as a group risks a Brown Act
   serial meeting.
3. **Urgent issues go to the City.** The page links the City Parks & Rec contact page
   and says to call 911 in an emergency, so this never becomes the only route.

## How it works

| Piece | File |
|---|---|
| Page (Liquid, form, nearby-parks section) | `feedback.html` → `/feedback` |
| Config: submission path, disclaimer, extra parks | `_data/park_feedback.yml` |
| Park list + centers (40 parks, GIS) | `_data/vacaville_parks.yml` |
| Browser logic (query param, picker, nearby parks, submit) | `assets/js/park-feedback.js` |
| Unit tests (pure helpers) | `test/park-feedback.test.js` — `npm test` |
| Data + built-page checks | `scripts/test_feedback_page.py` — `npm test` |

- `?park=<slug>` pre-selects the park, fills hidden `park_slug` / `park_name`, and marks
  `source=sign`. A bare `/feedback` shows the picker and marks `source=web`.
  The signs show the bare address, so sign visits count as `source=web`.
- The picker, the map markers, and the nearby list all call the same `setPark`, which
  also rewrites the URL (`history.replaceState`) so the page is shareable.
- Nearby parks: 5 closest by straight-line (haversine) distance between GIS centers,
  plus a Leaflet map (OpenStreetMap tiles, same pinned Leaflet 1.9.4 as `/map`).
- Form fields posted: `park_slug`, `park_name`, `category` (problem / idea / working),
  `message`, `contact` (optional), `source`, `page_url`, `_subject`, `_gotcha` (honeypot).

## Submission backend: Touchpoints

Decided 2026-11-06.
Create one Touchpoints form, then fill in `_data/park_feedback.yml`:

- `endpoint`: `https://touchpoints.app/api/forms/<uuid>/submit`
- `fields`: the question id for each answer below

| `fields` key | Question | Type | Required |
|---|---|---|---|
| `park` | Park | text | yes |
| `category` | Category | text | yes |
| `message` | Feedback | long text | yes |
| `contact` | Contact | text | no |
| `source` | Source | text | no |
| `page_url` | Page | text | no |

On the form, allow only `opensolano.org`, and keep Ryan as the only person who can read responses.
The page sends each answer as `submission[question_<id>]`, the same pattern as `_layouts/parcel.html`.
If a POST fails, the page offers the mailto instead.
`npm test` fails if `endpoint` is set and a question id is missing.

While `endpoint` is blank, submitting opens the visitor's mail app, and phones without one will stall.

`npm test` only proves the page is wired, not that feedback arrives.
Confirm delivery by submitting from the live page and reading the entry in Touchpoints.

## If the City takes it over

Ryan is starting this independently and will hand it over gladly.
Export the responses from Touchpoints, then point `endpoint` at the City's channel or redirect `/feedback` to it.

## Park identity notes

- 40 parks come from the City GIS export. **Little Oak Park** is on a sign but not in
  GIS; it is added in `_data/park_feedback.yml` with a Nominatim geocode of its City
  address (451 Salisbury Cir). That point is ~110 ft from the GIS centroid of
  **Southtown Pocket Park** — they are probably the same park under two names. Both
  slugs still work; if the City confirms, merge them and reprint one sign.
- Little Oak Park has no `/cities/vacaville/parks/<slug>/` page (`has_page: false`),
  so the summary line omits the park-page link.
- Sign name "Magnolia Park" is shown on the site under its GIS name
  "Southtown Magnolia Park" (slug `southtown-magnolia-park`, same on both).

## Launch checklist

- [x] Decide the backend: Touchpoints (2026-11-06)
- [x] Regenerate the signs without QR codes (2026-11-06)
- [ ] Create the Touchpoints form and set `endpoint:` and `fields:`
- [ ] `npm run build:css && bundle exec jekyll build && npm test` all OK
- [ ] Deploy `/feedback`
- [ ] Type the address from a printed sign on a phone, submit one test entry, and read it in Touchpoints
- [ ] Confirm `https://opensolano.org/feedback?park=alamo-creek-park` pre-selects Alamo Creek Park after deploy
- [ ] Then, and only then, post the signs
