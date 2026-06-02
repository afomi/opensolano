---
layout: post
title: "Assessing the Public Sector: Stewardship, Service, and the Tax Recirculation Loop"
date: 2026-04-12
author: ryan_wold
tags:
  - municipal finance
  - pensions
  - public sector
  - systems thinking
  - transparency
---

A mid-sized Solano County city operates on roughly $280M a year.
About a third of that now services pension obligations, and the share keeps rising.
The city is also, legitimately, one of the largest employers in town — public jobs are a feature, not a bug.
So is the trajectory unsustainable, or just misunderstood?

This post argues both questions are worth separating from the aggregate "is the budget balanced" question.
It also proposes a lens — the *tax recirculation coefficient* — for thinking about how different economies respond to tax policy depending on how much of a worker's tax dollar flows back to fund their own wage.

## Three accountabilities, usually collapsed into one

When residents ask whether their city is well-run, they are usually asking three different questions at once.
Separating them makes the answer more honest.

**Service delivery.**
Outputs per dollar.
Lane-miles paved, permits issued per FTE, median emergency response time, park acres maintained.
These are measurable and comparable across jurisdictions.
This is what most people mean by "is government working."

**Stewardship.**
The balance-sheet trajectory.
Unfunded pension liability as a share of revenue.
Pension contribution as a share of the general fund.
Deferred maintenance backlog.
OPEB (retiree health) exposure.
Stewardship is usually invisible until it crowds out service delivery.

**Economic base.**
Jobs provided.
Wage floor set by public pay scales.
Counter-cyclical employment that stabilizes the local economy in downturns.
This is real value, and it rarely appears in budget documents as a benefit — only as a cost line.

A city can look fine on any one dimension and be failing on another.
The diagnostic question is not "is the budget balanced this year" but **"is stewardship crowding out service delivery, and how fast?"**
That ratio — pension-and-debt-service share versus discretionary service share, tracked over five or ten years — tells you whether the trajectory is extractive.

## The tax recirculation coefficient

Here is an observation that changed how I think about my own paycheck.

I work in the public sector.
My wages are paid from a pool funded by taxes.
When I pay my taxes, a meaningful fraction of that dollar flows back into the same pool that pays me.
My "effective" tax rate — the rate at which dollars leave my household sector and do not return — is lower than the headline rate suggests.

A private-sector worker's tax dollar does not typically flow back to fund their own employer.
For them, tax is a more straightforward one-way transfer.

Call the returning fraction **`r`**, the *recirculation coefficient*.

- `r = 0` — a private-sector worker in an industry with no public contracts.
  Every tax dollar is a pure outflow from their sector.
- `r = 1` — a fully self-funded public sector (theoretical limit; nobody's actually here).
- `r ≈ 0.3–0.5` — a typical public employee in a locally-funded agency.
- `r ≈ 0.1–0.2` — a private-sector worker in a company with meaningful government contracts.

This is not a moral claim.
It is a structural one.
And it has consequences for how a local economy responds to tax decisions.

## Interactive: how `r` changes the effective tax dynamic

Drag the slider to see how the recirculation coefficient changes the effective flow of a worker's tax dollar.

<div class="my-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
  <div class="flex items-center justify-between mb-4">
    <label for="r-slider" class="text-sm font-semibold text-gray-900">Recirculation coefficient (r)</label>
    <span id="r-value" class="text-sm font-mono text-amber-700">0.00</span>
  </div>
  <input type="range"
         id="r-slider"
         min="0"
         max="1"
         step="0.01"
         value="0"
         class="w-full accent-amber-600" />
  <div class="mt-2 flex justify-between text-xs text-gray-500">
    <span>pure private</span>
    <span>typical private w/ gov contracts</span>
    <span>typical public employee</span>
    <span>fully self-funded</span>
  </div>

  <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
    <div class="rounded-lg bg-white border border-gray-200 p-4">
      <div class="text-xs uppercase tracking-wide text-gray-500">Headline tax rate</div>
      <div class="mt-1 text-2xl font-bold text-gray-900">25%</div>
    </div>
    <div class="rounded-lg bg-white border border-gray-200 p-4">
      <div class="text-xs uppercase tracking-wide text-gray-500">Effective outflow</div>
      <div id="effective-rate" class="mt-1 text-2xl font-bold text-amber-700">25.0%</div>
    </div>
    <div class="rounded-lg bg-white border border-gray-200 p-4">
      <div class="text-xs uppercase tracking-wide text-gray-500">Returns via wage pool</div>
      <div id="return-rate" class="mt-1 text-2xl font-bold text-emerald-600">0.0%</div>
    </div>
  </div>

  <p id="r-narrative" class="mt-4 text-sm text-gray-600 leading-relaxed">
    At <strong>r = 0</strong>, every tax dollar leaves the worker's sector.
    This is the case assumed by most public finance intuition.
  </p>
</div>

<script>
(function() {
  var slider = document.getElementById('r-slider');
  var rVal = document.getElementById('r-value');
  var effEl = document.getElementById('effective-rate');
  var retEl = document.getElementById('return-rate');
  var narr = document.getElementById('r-narrative');
  var headline = 0.25;

  function update() {
    var r = parseFloat(slider.value);
    var effective = headline * (1 - r);
    var returned = headline * r;
    rVal.textContent = r.toFixed(2);
    effEl.textContent = (effective * 100).toFixed(1) + '%';
    retEl.textContent = (returned * 100).toFixed(1) + '%';

    var msg;
    if (r < 0.1) {
      msg = 'At <strong>r = ' + r.toFixed(2) + '</strong>, nearly every tax dollar leaves the worker\'s sector. This is the case assumed by most public finance intuition.';
    } else if (r < 0.35) {
      msg = 'At <strong>r = ' + r.toFixed(2) + '</strong>, a small but real fraction of taxes returns to fund wages in the same sector. Typical for private workers in regions with meaningful government contracting.';
    } else if (r < 0.7) {
      msg = 'At <strong>r = ' + r.toFixed(2) + '</strong>, a substantial share of tax dollars recirculates. This is where many public employees in locally-funded agencies sit. Tax cuts here directly compress the wage pool.';
    } else {
      msg = 'At <strong>r = ' + r.toFixed(2) + '</strong>, the sector is nearly self-funded. Stabilizing, but the feedback loop can ossify — political incentives around taxation collapse because payers and recipients are the same population.';
    }
    narr.innerHTML = msg;
  }

  slider.addEventListener('input', update);
  update();
})();
</script>

## Why `r` matters at the policy level

Two cities with the same headline tax rate can have very different political dynamics depending on their aggregate `r`.

- **High-`r` economies** (company towns, heavy public-sector cities).
  Tax cuts hurt more because residents are partly cutting their own wages.
  Tax hikes sting less for the same reason.
  The system is stabilizing but can ossify — political incentives around fiscal discipline weaken when payers and beneficiaries overlap heavily.
- **Low-`r` economies.**
  Sharper political conflict over taxation, because the population that pays is structurally distinct from the population that receives.
  Budget fights are more adversarial.
  Reform pressure is higher but so is volatility.
- **Mixed economies** — most actual places.
  The ratio shapes which coalitions form around budget decisions, which ballot measures pass, and how quickly structural problems get addressed.

This is adjacent to but distinct from fiscal incidence analysis, which usually treats "who pays, who benefits" as a static question.
The recirculation lens treats it as a feedback loop.

## A causal loop diagram of the city's fiscal system

Here is an intermediately complex stocks-and-flows sketch — eight variables, three feedback loops — that illustrates how pension obligations, service delivery, and the recirculation loop interact.

<div class="my-8 overflow-x-auto rounded-xl border border-gray-200 bg-white p-6">
<svg viewBox="0 0 820 520" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto" role="img" aria-labelledby="cld-title cld-desc">
  <title id="cld-title">Causal loop diagram: municipal fiscal system</title>
  <desc id="cld-desc">Diagram showing three feedback loops: a reinforcing loop between public wages and the general fund (R1), a balancing loop between pension obligations and service quality (B1), and a slow reinforcing decline loop through tax base erosion (R2).</desc>

  <defs>
    <marker id="arrow-pos" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#059669" />
    </marker>
    <marker id="arrow-neg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#dc2626" />
    </marker>
  </defs>

  <!-- Nodes: stocks as rectangles, flows/variables as ellipses -->
  <!-- Stocks -->
  <rect x="340" y="20" width="140" height="50" rx="6" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
  <text x="410" y="50" text-anchor="middle" font-size="14" font-weight="600" fill="#78350f">General Fund</text>

  <rect x="600" y="150" width="160" height="50" rx="6" fill="#fee2e2" stroke="#dc2626" stroke-width="2"/>
  <text x="680" y="180" text-anchor="middle" font-size="14" font-weight="600" fill="#7f1d1d">Pension Liability</text>

  <rect x="60" y="150" width="160" height="50" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
  <text x="140" y="180" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">Public Wages (stock)</text>

  <rect x="340" y="280" width="140" height="50" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
  <text x="410" y="310" text-anchor="middle" font-size="14" font-weight="600" fill="#14532d">Service Quality</text>

  <!-- Flow variables -->
  <ellipse cx="140" cy="290" rx="80" ry="25" fill="#eff6ff" stroke="#60a5fa" stroke-width="1.5"/>
  <text x="140" y="295" text-anchor="middle" font-size="12" fill="#1e40af">Tax Revenue (via r)</text>

  <ellipse cx="680" cy="290" rx="80" ry="25" fill="#fef2f2" stroke="#f87171" stroke-width="1.5"/>
  <text x="680" y="295" text-anchor="middle" font-size="12" fill="#991b1b">Pension Contribution</text>

  <ellipse cx="140" cy="420" rx="80" ry="25" fill="#f5f3ff" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="140" y="425" text-anchor="middle" font-size="12" fill="#5b21b6">Tax Base / Population</text>

  <ellipse cx="680" cy="420" rx="80" ry="25" fill="#f5f3ff" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="680" y="425" text-anchor="middle" font-size="12" fill="#5b21b6">Outmigration Pressure</text>

  <!-- Arrows with polarity labels -->
  <!-- R1: General Fund -> Public Wages (+) -->
  <path d="M340,50 Q230,70 200,150" fill="none" stroke="#059669" stroke-width="2" marker-end="url(#arrow-pos)"/>
  <text x="245" y="100" font-size="13" font-weight="700" fill="#059669">+</text>

  <!-- Public Wages -> Tax Revenue (+) -->
  <path d="M140,200 L140,265" fill="none" stroke="#059669" stroke-width="2" marker-end="url(#arrow-pos)"/>
  <text x="148" y="235" font-size="13" font-weight="700" fill="#059669">+</text>

  <!-- Tax Revenue -> General Fund (+) [closes R1] -->
  <path d="M220,285 Q330,240 370,70" fill="none" stroke="#059669" stroke-width="2" marker-end="url(#arrow-pos)"/>
  <text x="315" y="180" font-size="13" font-weight="700" fill="#059669">+</text>

  <!-- R1 label -->
  <circle cx="260" cy="160" r="18" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/>
  <text x="260" y="165" text-anchor="middle" font-size="12" font-weight="700" fill="#059669">R1</text>

  <!-- B1: Pension Liability -> Pension Contribution (+) -->
  <path d="M680,200 L680,265" fill="none" stroke="#059669" stroke-width="2" marker-end="url(#arrow-pos)"/>
  <text x="688" y="235" font-size="13" font-weight="700" fill="#059669">+</text>

  <!-- Pension Contribution -> General Fund (-) [drains it] -->
  <path d="M600,290 Q500,230 480,70" fill="none" stroke="#dc2626" stroke-width="2" marker-end="url(#arrow-neg)"/>
  <text x="510" y="180" font-size="13" font-weight="700" fill="#dc2626">−</text>

  <!-- General Fund -> Service Quality (+) -->
  <path d="M410,70 L410,280" fill="none" stroke="#059669" stroke-width="2" marker-end="url(#arrow-pos)"/>
  <text x="418" y="180" font-size="13" font-weight="700" fill="#059669">+</text>

  <!-- Service Quality -> Pension Liability (indirect via tax tolerance): we'll draw Service Quality -> Outmigration (-) instead -->
  <path d="M480,305 Q580,360 600,420" fill="none" stroke="#dc2626" stroke-width="2" marker-end="url(#arrow-neg)"/>
  <text x="555" y="370" font-size="13" font-weight="700" fill="#dc2626">−</text>

  <!-- B1 label -->
  <circle cx="555" cy="160" r="18" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
  <text x="555" y="165" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">B1</text>

  <!-- R2: Outmigration -> Tax Base (-) -->
  <path d="M600,425 L220,422" fill="none" stroke="#dc2626" stroke-width="2" marker-end="url(#arrow-neg)"/>
  <text x="410" y="415" text-anchor="middle" font-size="13" font-weight="700" fill="#dc2626">−</text>

  <!-- Tax Base -> Tax Revenue (+) -->
  <path d="M140,395 L140,315" fill="none" stroke="#059669" stroke-width="2" marker-end="url(#arrow-pos)"/>
  <text x="148" y="360" font-size="13" font-weight="700" fill="#059669">+</text>

  <!-- R2 label -->
  <circle cx="410" cy="460" r="18" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
  <text x="410" y="465" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">R2</text>

  <!-- Legend -->
  <g transform="translate(20,20)">
    <rect x="0" y="0" width="200" height="90" rx="6" fill="#f9fafb" stroke="#d1d5db" stroke-width="1"/>
    <text x="10" y="18" font-size="11" font-weight="700" fill="#374151">Legend</text>
    <line x1="10" y1="34" x2="40" y2="34" stroke="#059669" stroke-width="2" marker-end="url(#arrow-pos)"/>
    <text x="48" y="38" font-size="11" fill="#374151">same-direction (+)</text>
    <line x1="10" y1="54" x2="40" y2="54" stroke="#dc2626" stroke-width="2" marker-end="url(#arrow-neg)"/>
    <text x="48" y="58" font-size="11" fill="#374151">opposite-direction (−)</text>
    <rect x="10" y="68" width="14" height="10" fill="#fef3c7" stroke="#d97706"/>
    <text x="30" y="78" font-size="11" fill="#374151">stock</text>
    <ellipse cx="90" cy="73" rx="14" ry="6" fill="#eff6ff" stroke="#60a5fa"/>
    <text x="112" y="78" font-size="11" fill="#374151">flow</text>
  </g>
</svg>
</div>

Three loops worth naming:

- **R1 — the wage recirculation loop (reinforcing, fast).**
  General fund pays public wages.
  Public wages generate tax revenue (scaled by `r`).
  Tax revenue feeds the general fund.
  This is the loop my opening observation describes.
  It stabilizes the system in normal times and makes public employment a genuine counter-cyclical asset.
- **B1 — the stewardship loop (balancing, structural).**
  Pension liabilities drive required contributions.
  Contributions drain the general fund.
  The general fund that remains funds services.
  When pension share grows faster than revenue, services erode.
  This is the loop my city is losing.
- **R2 — the slow decline loop (reinforcing, years to decades).**
  Eroded services increase outmigration pressure.
  Outmigration shrinks the tax base.
  A smaller tax base reduces revenue.
  Less revenue means more pressure on services.
  Once R2 dominates, recovery is expensive and slow — this is the Vallejo-in-2008 story.

The interesting policy question is **which loop dominates at which horizon**, and what interventions shift that.
Pension reform acts on B1.
Economic development acts on R2.
Neither is visible in a single fiscal year.

## What this suggests for civic assessment

A productive public-sector performance assessment should, at minimum, track:

1. **Service delivery ratios** — outputs per dollar, year over year, and benchmarked against peer jurisdictions.
2. **Stewardship trajectory** — pension-and-debt-service as a share of general fund, five- and ten-year trend.
3. **Recirculation estimate** — rough `r` for the local economy, to calibrate how tax policy will actually land.
4. **Loop dominance** — which of R1, B1, R2 is moving fastest, and in which direction.

None of these are hard to compute.
Most are buried in the ACFR (the comprehensive annual financial report) that every city publishes.
The work is surfacing them in a form residents can read, and tracking them over time so trajectories are visible.

That's the direction OpenSolano is heading.
If you want to help — or if you want to argue with any of the framing above — [get in touch](mailto:ryan@civic.studio) or join the next [meetup](/meetup/).

## Further reading and caveats

- The recirculation coefficient is a sketch, not a calibrated model.
  A real estimate would account for indirect recirculation (public employee spending at local businesses that pay local taxes), progressive rate structures, and the share of taxes that go to non-local levels of government.
- The CLD omits several real loops: state and federal transfers, bond issuance, capital project cycles, and the political economy of ballot measures.
  Any of these can dominate in particular years.
- "Unsustainable" is a direction, not a state.
  A trajectory that looks dire over twenty years can be redirected by five years of disciplined stewardship.
  The point of the assessment is to make the trajectory visible early enough to act.
