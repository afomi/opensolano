# Analytics Plan

Currently **no analytics are instrumented**. This document defines what to measure and why, tied to personas and stories.

## Proposed Metrics

| Metric | Event | Persona | Story | Purpose |
|--------|-------|---------|-------|---------|
| Page views by path | Page load | all | — | Understand which content is visited; identify underserved jurisdictions |
| Post read depth | Scroll percentage on posts | resident | RS-2 | Measure engagement with analysis content |
| Dataset download count | Click on download link | researcher | RE-1 | Validate demand for open data |
| Meetup signup count | Form submission | meetup_attendee | MA-2 | Track community growth |
| Meetup page visits | Page load on /meetup/ | meetup_attendee | MA-1 | Measure interest vs. conversion to signup |
| RSS subscriber count | Feed requests (via server logs or feed proxy) | resident, researcher | SM-1 | Track returning audience |
| Tag page visits | Page load on /tags/* | resident | RS-3 | Understand which topics resonate |
| Public Funds page visits | Page load on /public-funds/ | resident | RS-1 | Gauge interest in budget transparency |
| Contact/volunteer inquiries | Email link clicks or form submissions | volunteer | VO-2 | Measure volunteer pipeline |

## Feedback Loops

Analytics should flow back into the product cycle:

- **High traffic to a jurisdiction** → prioritize content for that city (informs RS-3 and similar stories)
- **Low dataset downloads** → investigate: is the data hard to find, or is demand low? (informs RE-1, RE-2)
- **Meetup signup drop-off** → improve the signup flow or page clarity (informs MA-1, MA-2)
- **Popular tags** → write more content on those topics (informs RS-2)
- **No traffic to a page** → consider removing or reworking it

## Tool Recommendation

For a civic transparency site, a **privacy-respecting analytics tool** is appropriate:

- **Plausible** (plausible.io) — lightweight, no cookies, GDPR-compliant, open source
- **Umami** (umami.is) — self-hosted option, no cookies
- **Server logs** — minimal approach using CloudFront access logs (already available via AWS)

Avoid Google Analytics — it conflicts with the project's transparency and privacy values.

## Implementation Status

- [ ] Choose analytics tool
- [ ] Instrument page views
- [ ] Instrument dataset download clicks
- [ ] Instrument meetup signup submissions
- [ ] Set up dashboard tied to personas
- [ ] Schedule quarterly review of analytics → new stories
