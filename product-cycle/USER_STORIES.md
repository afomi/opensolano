# User Stories

Stories are grouped by persona. Each story has acceptance criteria in Given/When/Then format.

---

## resident

### RS-1: View current budget data

As a **resident**,
I want to see current 2025 budget data for my city,
so that I can understand how my tax dollars are spent.

**Acceptance Criteria:**

- Given budget data files have been updated with FY2025 data for at least 3 cities,
  When I visit the Public Funds page,
  Then I see budget breakdowns for those cities with the fiscal year labeled.

- Given I am viewing a city's budget,
  When I look at the data,
  Then I see a "last updated" date so I know how current it is.

**Concepts:** jurisdiction, budget_data, fiscal_year

---

### RS-2: Read civic analysis

As a **resident**,
I want to read fresh analysis posts about my city,
so that I trust the site is active and relevant.

**Acceptance Criteria:**

- Given at least one post has been published in the current quarter,
  When I visit the homepage,
  Then the "Latest Analysis" section shows content dated within the last 90 days.

**Concepts:** post, author, tag

---

### RS-3: Find content about my city

As a **resident** (specifically a Vallejo resident),
I want to find content about my city,
so that I feel included and informed.

**Acceptance Criteria:**

- Given at least 2 posts are tagged with "vallejo",
  When I click the Vallejo tag,
  Then I see a filtered list of relevant posts.

- Given I visit the jurisdictions page,
  When I find Vallejo in the list,
  Then I see recent news and links for Vallejo.

**Concepts:** jurisdiction, post, tag, news

---

## researcher

### RE-1: Download raw datasets

As a **researcher**,
I want to download raw datasets in CSV or JSON format,
so that I can perform my own analysis.

**Acceptance Criteria:**

- Given at least one dataset is available for download,
  When I click the download link on the datasets section,
  Then a valid CSV or JSON file downloads to my machine.

- Given I have downloaded a dataset,
  When I open the file,
  Then it contains headers/keys that match the dataset description and the data is non-empty.

**Concepts:** dataset, jurisdiction

---

### RE-2: Understand data provenance

As a **researcher**,
I want to see the source and last-updated date for each dataset,
so that I can assess reliability and cite it properly.

**Acceptance Criteria:**

- Given I am viewing the datasets section,
  When I look at a dataset entry,
  Then I see the source agency, format, and last-updated date.

**Concepts:** dataset

---

## volunteer

### VO-1: Submit meeting notes

As a **volunteer**,
I want to submit meeting notes from a public meeting I attended,
so that I can help document local government proceedings.

**Acceptance Criteria:**

- Given a contribution process is documented on the site,
  When I follow the submission instructions,
  Then I receive an acknowledgment that my notes were received.

**Concepts:** meeting_transcript, volunteer_contribution

---

### VO-2: Understand how to contribute

As a **volunteer**,
I want to see what kinds of contributions are needed and what the process looks like,
so that I know whether I can help and how to start.

**Acceptance Criteria:**

- Given I visit a "How to Contribute" section,
  When I read the page,
  Then I see at least 3 ways to contribute with a description of effort level and skills needed.

**Concepts:** volunteer_contribution

---

## meetup_attendee

### MA-1: Find next meetup date

As a **meetup_attendee**,
I want to see the specific date and location of the next meetup,
so that I can plan to attend.

**Acceptance Criteria:**

- Given the meetup page exists,
  When I visit it,
  Then I see a specific upcoming date (not just "Monday evenings") and a confirmed location.

- Given the displayed meetup date is in the past,
  When I visit the page,
  Then the next future date is shown instead.

**Concepts:** meetup_event

---

### MA-2: Sign up for the meetup

As a **meetup_attendee**,
I want to sign up so that the organizers know I'm coming.

**Acceptance Criteria:**

- Given I am on the meetup page,
  When I fill out the signup form and submit,
  Then I see a confirmation message and the organizer receives my info.

**Concepts:** meetup_event, meetup_signup

---

## site_maintainer

### SM-1: Provide an RSS feed

As a **site_maintainer**,
I want the site to have a valid RSS feed,
so that readers can follow updates in their feed readers and search engines can discover new content.

**Acceptance Criteria:**

- Given the site has been built,
  When a user or crawler requests /feed.xml,
  Then they receive a valid RSS 2.0 or Atom feed containing the most recent posts.

**Concepts:** post, feed

---

### SM-2: Add structured data for SEO

As a **site_maintainer**,
I want pages to include JSON-LD structured data,
so that search engines can better index civic content and show rich results.

**Acceptance Criteria:**

- Given a blog post page is rendered,
  When I inspect the HTML,
  Then I find valid JSON-LD with Article schema including headline, datePublished, and author.

- Given the homepage is rendered,
  When I run Google Rich Results Test,
  Then it passes with no errors.

**Concepts:** post, structured_data

---

### SM-3: Track site usage

As a **site_maintainer**,
I want to see basic analytics (page views, dataset downloads, meetup signups),
so that I can measure impact and prioritize content.

**Acceptance Criteria:**

- Given analytics instrumentation is in place,
  When a user visits a page or downloads a dataset,
  Then the event is recorded and visible in an analytics dashboard.

**Concepts:** analytics_event
