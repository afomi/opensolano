# Data Sources

Provenance for checked-in data files in `assets/data/`. Every dataset here
should record where it came from, when it was retrieved, and what its columns
mean — so the user, readers, and future tools can trace any figure back to its
origin. See the project's data-provenance goal in `DESIGN.md` / `PLAN.md`.

| File | Source | Retrieved | Notes |
|---|---|---|---|
| `checkbook_data_2026-04-08.csv` | City of Vacaville open-spending portal — <https://cityofvacaville-ca.spending.socrata.com/> | 2026-04-08 | Socrata-hosted checkbook of vendor payments by fund. |
| `govai-coalition-members.csv` / `.json` | GovAI Coalition member roster | — | Coalition membership list. |

## checkbook_data_2026-04-08.csv

- **Origin:** City of Vacaville's Socrata open-spending portal
  (<https://cityofvacaville-ca.spending.socrata.com/>). Exported 2026-04-08.
- **Granularity:** one row per payment line (24,294 rows).
- **Columns:** `Vendor`, `Fund`, `Check #`, `Date`, `Amount`.
- **Used by:** `/public-funds/checkbook/` (`checkbook.html`), which loads the
  raw CSV client-side and aggregates by vendor and fund.
- **Refresh:** re-export from the portal for a newer date, drop the new file
  here, and update the date string in `checkbook.html` (filename label,
  `sourceUrl`, and the source-card copy) plus the row above.
