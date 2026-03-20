# Concept Inventory

| Concept | Description | Related Personas | Related Stories |
|---------|-------------|-----------------|-----------------|
| jurisdiction | A city or county with its own government (Fairfield, Vallejo, etc.) | resident, researcher | RS-1, RS-3, RE-1 |
| agency | A government organization operating within a jurisdiction (city government, school district) | resident, researcher | — (implicit in data model, not yet storied) |
| body | A governing body within an agency (city council, planning commission) | resident, volunteer | — (implicit in data model, not yet storied) |
| position | An official role within a governing body (Mayor, Councilmember) | resident | — (implicit in data model, not yet storied) |
| person | An individual holding a government position | resident | — (collection exists but unpopulated; no stories yet) |
| service | A government service offered to the public | resident | — (collection exists but unpopulated; no stories yet) |
| post | A blog article with civic analysis or news | resident, researcher, site_maintainer | RS-2, RS-3, SM-1, SM-2 |
| author | A content creator with credentials and identity | resident, researcher | RS-2 |
| tag | A topical label on a post (housing, impact fees, governance) | resident, researcher | RS-2, RS-3 |
| dataset | A public data source available for download (budget, fees, property records) | researcher, site_maintainer | RE-1, RE-2, SM-3 |
| budget_data | Financial data for a jurisdiction's fiscal year | resident, researcher | RS-1 |
| fiscal_year | The time period a budget covers | resident, researcher | RS-1 |
| news | A recent headline or update from a city's newsroom | resident | RS-3 |
| meeting_transcript | Notes or transcript from a public government meeting | volunteer, researcher | VO-1 |
| volunteer_contribution | A submission from a community member (meeting notes, data, etc.) | volunteer | VO-1, VO-2 |
| meetup_event | A specific instance of the Solano Creative Tech Meetup | meetup_attendee | MA-1, MA-2 |
| meetup_signup | A registration for a meetup event | meetup_attendee | MA-2 |
| feed | RSS/Atom feed of recent posts | site_maintainer, resident | SM-1 |
| structured_data | JSON-LD schema markup embedded in pages | site_maintainer | SM-2 |
| analytics_event | A tracked user action (page view, download, signup) | site_maintainer | SM-3 |

## Notes

- **agency**, **body**, **position**, **person**, and **service** exist as Jekyll collections but have no user stories yet. Stories should be written when these collections are populated and surfaced to users.
- **Synonym watch:** "city" (in `solano_cities.yml`) and "jurisdiction" (in collections) refer to the same concept. Standardize on **jurisdiction** in product artifacts; "city" is acceptable in user-facing copy.
