# Data Model

This documents the domain entities, their attributes, and relationships. It formalizes what already exists in the Jekyll collections and data files, plus planned entities from user stories.

## Entity Relationship Diagram

```mermaid
erDiagram
    JURISDICTION ||--o{ AGENCY : contains
    JURISDICTION ||--o{ NEWS : has
    AGENCY ||--o{ BODY : has
    AGENCY ||--o{ POSITION : has
    AGENCY ||--o{ SERVICE : provides
    BODY ||--o{ POSITION : includes
    POSITION ||--o| PERSON : held_by
    AUTHOR ||--o{ POST : writes
    POST ||--o{ TAG : labeled_with
    JURISDICTION ||--o{ DATASET : covers
    JURISDICTION ||--o{ BUDGET_DATA : publishes
    MEETUP_EVENT ||--o{ MEETUP_SIGNUP : receives

    JURISDICTION {
        string slug PK
        string name
        string website
        string newsroom
        string logo
    }

    AGENCY {
        string id PK
        string name
        string slug
        string description
        string city
        string address
        string email
        string phone
        string url
        float lat
        float lng
        string jurisdiction_id FK
    }

    BODY {
        string id PK
        string name
        string slug
        int size
        string url
        string agency_id FK
        string jurisdiction_id FK
    }

    POSITION {
        string id PK
        string slug
        string label
        string role
        string district
        date start_date
        date end_date
        boolean compensated
        string body_id FK
        string agency_id FK
        string person_id FK
    }

    PERSON {
        string id PK
        string name
        string bio
        string image_url
    }

    SERVICE {
        string id PK
        string name
        string description
        string jurisdiction_id FK
    }

    POST {
        string slug PK
        string title
        date date
        string content
        string author_id FK
    }

    AUTHOR {
        string id PK
        string name
        string title
        string bio
        string email
        string avatar
        string did
    }

    TAG {
        string slug PK
        string name
    }

    DATASET {
        string id PK
        string title
        string description
        date last_updated
        string format
        string source
        string use_case
    }

    BUDGET_DATA {
        string id PK
        string jurisdiction_id FK
        string fiscal_year
        date last_updated
    }

    NEWS {
        string id PK
        string city FK
        string title
        string url
        date date
        string summary
    }

    MEETUP_EVENT {
        string id PK
        date date
        string location
        string description
    }

    MEETUP_SIGNUP {
        string id PK
        string meetup_event_id FK
        string name
        string email
        date signed_up_at
    }
```

## Entity Descriptions

| Entity | Source | Status | Notes |
|--------|--------|--------|-------|
| JURISDICTION | `_data/solano_cities.yml` + `_jurisdictions/` collection | Partial | Data file populated; collection empty. Consolidate to one source. |
| AGENCY | `_agencies/` collection | Active | 3 items. References jurisdiction, bodies, positions, services. |
| BODY | `_bodies/` collection | Active | 9 items. City councils and boards. |
| POSITION | `_positions/` collection | Active | 46 items. Roles within bodies. |
| PERSON | `_people/` collection | Empty | Collection defined but no entries. Positions reference person but link is null. |
| SERVICE | `_services/` collection | Empty | Collection defined but no entries. |
| POST | `_posts/` collection | Active | 9 blog posts. |
| AUTHOR | `_data/authors.yml` | Active | 3 authors with rich metadata including DIDs. |
| TAG | Implicit in post frontmatter | Active | No standalone tag definitions; derived from post `tags[]`. |
| DATASET | `_data/datasets.yml` | Active | 5 dataset catalog entries. No actual downloadable files yet. |
| BUDGET_DATA | Planned | Missing | Referenced in stories (RS-1) but no data files exist. |
| NEWS | `_data/solano_city_news.yml` | Active | Weekly city news highlights. |
| MEETUP_EVENT | Hardcoded in `meetup.html` | Partial | No structured data; date/location are in page HTML. |
| MEETUP_SIGNUP | External (Airtable) | External | Signup form posts to Airtable; no local data. |

## Gaps

1. **PERSON** collection is empty — positions have dangling `person.data` references.
2. **JURISDICTION** has dual sources (`solano_cities.yml` and `_jurisdictions/` collection) — should consolidate.
3. **BUDGET_DATA** is referenced in stories but has no implementation yet.
4. **MEETUP_EVENT** is not structured data — dates are hardcoded in HTML.
5. **TAG** has no canonical list — derived implicitly from posts.
