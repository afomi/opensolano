// Unit tests for assets/js/park-feedback.js (pure helpers only).
// Run: node --test test/
const test = require("node:test");
const assert = require("node:assert/strict");
const PF = require("../assets/js/park-feedback.js");

// Centers copied from _data/vacaville_parks.yml (City of Vacaville GIS).
const PARKS = [
  { slug: "alamo-creek-park", park_name: "Alamo Creek Park", center: [38.356659, -122.00869] },
  { slug: "andrews-park", park_name: "Andrews Park", center: [38.357547, -121.986071] },
  { slug: "hemlock-park", park_name: "Hemlock Park", center: [38.366667, -122.001603] },
  { slug: "north-orchard-park", park_name: "North Orchard Park", center: [38.373724, -122.003556] },
  { slug: "city-hall-park", park_name: "City Hall Park", center: [38.351975, -121.995061] },
  { slug: "three-oaks-park", park_name: "Three Oaks Park", center: [38.340795, -121.9945] },
  { slug: "no-center-park", park_name: "No Center Park", center: null }
];

test("haversineMiles matches an independently computed distance", () => {
  const miles = PF.haversineMiles(PARKS[0].center, PARKS[1].center);
  assert.ok(Math.abs(miles - 1.227) < 0.002, `got ${miles}`);
  assert.equal(PF.haversineMiles(PARKS[0].center, PARKS[0].center), 0);
});

test("parkSlugFromSearch reads ?park= and normalizes it", () => {
  assert.equal(PF.parkSlugFromSearch("?park=alamo-creek-park"), "alamo-creek-park");
  assert.equal(PF.parkSlugFromSearch("?utm=x&park=Alamo-Creek-Park#top"), "alamo-creek-park");
  assert.equal(PF.parkSlugFromSearch("?park=alamo%2Dcreek%2Dpark"), "alamo-creek-park");
  assert.equal(PF.parkSlugFromSearch("?park="), null);
  assert.equal(PF.parkSlugFromSearch(""), null);
  assert.equal(PF.parkSlugFromSearch(undefined), null);
});

test("findPark returns the park or null for unknown slugs", () => {
  assert.equal(PF.findPark(PARKS, "hemlock-park").park_name, "Hemlock Park");
  assert.equal(PF.findPark(PARKS, "not-a-park"), null);
  assert.equal(PF.findPark(PARKS, null), null);
});

test("nearestParks excludes the park itself, sorts ascending, honors limit, skips missing centers", () => {
  const near = PF.nearestParks(PARKS, PARKS[0], 3);
  assert.deepEqual(
    near.map((n) => n.park.slug),
    ["hemlock-park", "city-hall-park", "north-orchard-park"]
  );
  for (let i = 1; i < near.length; i++) assert.ok(near[i].miles >= near[i - 1].miles);
  const all = PF.nearestParks(PARKS, PARKS[0]);
  assert.equal(all.length, 5);
  assert.ok(!all.some((n) => n.park.slug === "alamo-creek-park"));
  assert.ok(!all.some((n) => n.park.slug === "no-center-park"));
});

test("formatMiles rounds to tenths and floors tiny distances", () => {
  assert.equal(PF.formatMiles(0.02), "< 0.1 mi");
  assert.equal(PF.formatMiles(1.2271), "1.2 mi");
});

test("buildMailto encodes the park, category, message and contact", () => {
  const href = PF.buildMailto("ryan@civic.studio", {
    park_slug: "alamo-creek-park",
    park_name: "Alamo Creek Park",
    category: "problem",
    message: "Drinking fountain by the playground is broken & leaking.",
    contact: "",
    source: "sign",
    page_url: "https://opensolano.org/feedback?park=alamo-creek-park"
  });
  assert.ok(href.startsWith("mailto:ryan%40civic.studio?subject="));
  const subject = decodeURIComponent(/subject=([^&]*)/.exec(href)[1]);
  const body = decodeURIComponent(/body=(.*)$/.exec(href)[1]);
  assert.equal(subject, "Park feedback: Alamo Creek Park (Something needs attention)");
  assert.match(body, /Park: Alamo Creek Park \[alamo-creek-park\]/);
  assert.match(body, /broken & leaking/);
  assert.match(body, /Contact: \(none given\)/);
  assert.match(body, /Source: sign/);
});

test("buildSubmissionBody maps answers to Touchpoints question ids", () => {
  const body = PF.buildSubmissionBody(
    {
      park_name: "Alamo Creek Park",
      park_slug: "alamo-creek-park",
      category: "problem",
      message: "Broken swing & gate",
      contact: "",
      source: "web"
    },
    { park: 11, category: 12, message: 13, contact: 14, source: 15, page_url: 16 }
  );
  const params = new URLSearchParams(body);
  assert.equal(params.get("submission[question_11]"), "Alamo Creek Park [alamo-creek-park]");
  assert.equal(params.get("submission[question_13]"), "Broken swing & gate");
  assert.equal(params.get("submission[question_15]"), "web");
  assert.ok(params.get("submission[question_12]"));
  assert.equal(params.has("submission[question_14]"), false);
  assert.equal(params.has("submission[question_16]"), false);
});

test("buildSubmissionBody leaves out answers with no question id", () => {
  assert.equal(PF.buildSubmissionBody({ message: "Hello" }, {}), "");
});

test("escapeHtml neutralizes markup", () => {
  assert.equal(PF.escapeHtml('<a href="x">&</a>'), "&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
});
