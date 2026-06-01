---
layout: project
title: "Municipal Code Review"
description: "Using LLMs to make Solano County's municipal codes readable, searchable, and auditable by residents -- plain-language summaries, flags for outdated provisions, and cross-jurisdiction comparisons."
status: proposed
tags:
  - transparency
  - municipal code
  - AI
related_posts:
  - /2024/09/05/building-digital-capacity-solano-county/
related_pages:
  - title: "Jurisdictions"
    url: "/jurisdictions/"
    description: "All Solano County cities and the county government"
contribute_url: "https://github.com/opensolano/opensolano.github.io"
---

## What this is

Inspired by [BetterEU](https://bettereu.com/), this project runs Solano County municipal codes through LLMs with transparent, published prompts.
The goal isn't "keep or delete" -- it's **explain, flag, compare**:

1. **Plain-language summaries** -- Each code section gets an LLM-generated summary a non-lawyer can understand.
2. **Flags** -- Identify sections that are outdated, redundant, internally contradictory, or unusually restrictive compared to peer jurisdictions.
3. **Cross-jurisdiction comparison** -- Highlight where Solano cities differ on the same topic (ADU regulations, business licensing, noise ordinances).
4. **Prompt transparency** -- The exact prompt and code are published so residents can evaluate the AI's reasoning.

## Current status

**Proposed.**
The concept is designed and documented.
Municipal code sources have been identified for Vacaville, Fairfield, Solano County, Dixon, and Vallejo.
No code has been scraped or analyzed yet.

## Phasing

- **Phase 1: Capture** -- Scrape, parse, and normalize municipal code into structured data.
- **Phase 2: First analysis** -- Plain-language summaries for one jurisdiction as proof of concept.
- **Phase 3: Additional analyses** -- Flags and cross-jurisdiction comparisons as independent passes over the same data.
- **Phase 4: Public feedback** -- Residents can submit corrections and context on specific sections, with visible status tracking.

## What we need

- **Platform identification.** Which hosting platform does each jurisdiction use? (Municode, American Legal, Sterling Codifiers, custom?) This affects the scraping strategy.
- **Legal expertise.** If you're a local attorney or planning professional who can validate LLM summaries against the actual legal meaning, your review is especially valuable.
- **Technical contributors.** Python, scraping, LLM API experience. The architecture is designed but not built.
- **Resident testers.** When summaries are generated, we need people who've actually dealt with the code (building permits, business licenses, noise complaints) to say whether the summaries match reality.

## Design principles

- **Section is the unit of analysis.** Each code section is one LLM call. This maps to how the code is structured and how amendments target changes.
- **Cache aggressively.** Code doesn't change often. LLM outputs are stored keyed to a hash of the input. Only re-analyze when content changes.
- **Every piece of feedback has a visible status.** Submitted, acknowledged, categorized, responded to. No black holes.
- **Feedback is public.** Other residents can see what's been submitted and how it was handled.

## How to contribute

See the [contributing guide](/contribute/) for how to get involved with OpenSolano projects, including how to submit data corrections and improvements via GitHub.
