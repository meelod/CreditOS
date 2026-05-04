# CreditOS — Private Credit Underwriting Workspace

A prototype underwriting workspace for a direct-lending team — pipeline tracking, deal detail with capital structure, due diligence management, and IC memo generation.

## Brief

- Built in a handful of hours.
- No access to client systems — all data is hand-built mocks.
- Optimized to impress both a technical audience (architecture, data model, separation of concerns) and a non-technical investment team (Excel-native UX: AG Grid everywhere, Ant Design primitives, dense tabular data, no flashy elements).

## Run it

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Requires Node 20+. No external services.

---

## 1. What you built

A multi-page Next.js app modelled on how a deal team actually works through a private credit transaction:

- **Pipeline (`/`)** — every deal in flight, in a single AG Grid. Sortable, filterable (stage chips, quick-filter, column filters), CSV-exportable. Numeric columns are right-aligned and tabular. Click a row to open the deal.
- **Deal detail (`/deals/[id]`)** — header strip with key economics (size, hold, leverage, LTV, yield, spread), then four tabs:
  - **Overview** — investment thesis, historical & projected financials, key risks & mitigants, deal snapshot, key terms, financial covenants.
  - **Capital Structure** — sources of capital with cumulative leverage at each tranche, capital-stack visualization, our position summary, and a one-click −20% EBITDA stress.
  - **Due Diligence** — KPI summary (% complete, in progress, flagged, days to IC), then a **Grid / Calendar** toggle. Grid groups items by workstream (Financial / Legal / Commercial / Operational / ESG / Tax / Insurance). Calendar lays out items on a 5-week month view, color-coded by workstream, with completed items struck through and flagged items badged.
  - **IC Memo** — one click renders a structured memo from the deal data (executive summary, financials, capital structure, terms, risks, diligence status, recommendation). Downloadable as `.txt`.
- **Portfolio (`/portfolio`)** — closed positions with funded amount, leverage, LTV, yield, performance status.
- **Market Comps (`/markets`)** — recent direct-lending comps grid plus sector spread trend table.
- **Add-Note drawer** — anywhere on a deal page, "Add Note" opens a side drawer with category-tagged note history (Diligence / Sponsor / Legal / IC Prep / General) and an inline composer.

Every section header has an **Edit** affordance signalling that field-level edits ship inline in production.

---

## 2. Architecture

```
Next.js 16 App Router  +  React 19  +  TypeScript
       │
       ├── Ant Design v6        (Layout, Menu, Card, Tabs, Drawer,
       │                         Descriptions, Tag, Statistic, Form)
       ├── AG Grid v35          (every tabular dataset, themed via
       │                         themeQuartz with a shared wrapper)
       └── Tailwind v4          (utility classes for layout/spacing)

App routes:
  app/page.tsx              → PipelineGrid
  app/deals/[id]/page.tsx   → DealHeader + DealTabs (Overview, Caps,
                                                     Diligence, Memo)
  app/portfolio/page.tsx    → KPI cards + closed-deal grid
  app/markets/page.tsx      → comps grid + sector-spread grid

Component layer:
  components/AppShell.tsx           → Sider + Header + Content
  components/PipelineGrid.tsx       → AG Grid for the pipeline
  components/DataGrid.tsx           → shared AG Grid wrapper (theme,
                                       defaults). All other tables use it.
  components/DealHeader.tsx         → metrics strip, drawer trigger
  components/DealTabs.tsx           → antd Tabs hosting the four tab
                                       components
  components/tabs/*                 → one file per tab
  components/AddNoteDrawer.tsx      → side drawer with note history
  components/EditButton.tsx         → consistent inline-edit affordance

Data layer (no backend yet):
  lib/types.ts   → Deal, Tranche, DDItem, Risk, FinancialPeriod, …
  lib/data.ts    → 8 hand-built deals across stages and sectors
  lib/memo.ts    → deterministic memo template (consumes a Deal,
                    returns formatted plain text)
  lib/utils.ts   → formatCurrency / formatMultiple / formatPercent /
                    formatDate
```

Rendering: most deal pages are client components (AG Grid + interactive filters/tabs/drawer). The deal route itself is a server component that loads from the static deal store and passes a serializable `Deal` down. `generateStaticParams` pre-renders every deal page at build.

The "everything is one grid wrapper" decision was deliberate. Once `DataGrid.tsx` exists, every dataset on the deal page (financials, risks, tranches, diligence) gets the same theme, the same sort/filter/resize behaviour, and the same tabular numerals — no surprises for an Excel-native user.

---

## Design choices (and why)

These are the decisions made during the build, in roughly the order they came up. Several were course-corrected based on direct feedback from the investment audience.

**Audience-first UX over visual polish.** The user is an Excel-native deal team. Early drafts had hero KPI cards, a kanban pipeline, gradient accents, and animated transitions — all torn out. Replaced with dense AG Grid tables, neutral colors, no animations beyond essential feedback. Excel is the mental model.

**AG Grid for every tabular dataset, not just the pipeline.** Initially used a custom HTML table for the pipeline, then antd `Table` for everything inside the deal page. Both got replaced with AG Grid via a single shared wrapper (`components/DataGrid.tsx`). One sort/filter/resize behaviour, one theme, tabular numerals everywhere. An Excel user lands and immediately knows how to interact with every grid on the page.

**Ant Design for primitives, not a custom design system.** Buttons, Cards, Tabs, Drawer, Descriptions, Tag, Statistic, Form, Segmented — all antd. The look is "enterprise data tool," which is exactly what credit underwriting software looks like (DealCloud, Pitchbook, Backstop). Building bespoke components would burn time without gaining anything the audience values.

**No KPI hero cards or kanban on the pipeline.** The first version had four big metric cards and a kanban view above the grid. The investment team explicitly didn't want them — they want data, sortable. Stage filtering is a chip row above the grid, not a board.

**3-item sidebar (Pipeline / Portfolio / Markets), not 4.** "IC Memos" was originally a top-level page; it was redundant because every deal already has an IC Memo tab. Fewer top-level destinations = lower learning curve. Each remaining section serves a distinct workflow (origination · monitoring · pricing intelligence).

**Tabs on the deal page, not nested routes.** Overview / Capital Structure / Due Diligence / IC Memo all live under one route (`/deals/[id]`) with antd `Tabs`. The deal context (header strip, breadcrumb) stays sticky; flipping between tabs feels like flipping between sections of the same memo, not navigating between pages.

**Calendar view in Due Diligence (toggled, not always on).** Diligence has both a Grid view (workstream-grouped tables) and a Calendar view (5-week month grid, color-coded by workstream, completed items struck through, flagged items badged). The grid is the default because it's what the team uses today; the calendar is a one-click upgrade for IC-prep weeks where what matters is "what's due before Friday." A `Segmented` control switches them.

**Add-Note is a Drawer, not a modal or a separate page.** A modal blocks the deal context; a separate page costs a navigation. A right-side drawer keeps the deal visible behind it, supports scroll-through note history, and is the standard antd pattern for contextual side-panels.

**Edit buttons everywhere, but mocked.** Every section header has an `Edit` affordance that fires a toast in this prototype. They're there to make clear that field-level inline editing is the production model — not modal forms, not a separate "edit mode" toggle. In production each `Edit` opens an inline editor scoped to that section.

**IC Memo is a deterministic typed function, not an LLM call.** `lib/memo.ts` exports `buildMemo(deal: Deal): string`. It interpolates typed fields into template literals — no regex, no parsing, no LLM. Rationale: deterministic output, fully reviewable, no failure modes, no API key. The template is what production-grade tools generate today; an LLM rewrite is a Day-2 enhancement, not the demo's value prop. (Earlier versions streamed character-by-character to feel "AI-like" — pulled out per feedback that nothing should feel LLM-flavored.)

**One `Deal` aggregate type, not normalized tables.** The data model collapses what would be 6+ tables in a real backend (deals, tranches, diligence items, risks, covenants, financials, terms) into a single `Deal` shape. This makes the memo template, the deal page, and the pipeline grid all one-line renderers over a typed object. In production each array becomes its own table joined to deals; the prototype skips the join.

**Static `lib/data.ts` instead of a backend.** Every page reads the same in-memory deals array. `generateStaticParams` pre-renders every deal page at build. Swapping in a real DB (Postgres + Drizzle, schema mirrors `lib/types.ts`) is a one-file change. Building a backend now would be the slowest path to "this looks credible to a deal team."

**Server components for routes, client components for grids.** The deal route (`app/deals/[id]/page.tsx`) is a server component — it loads from the static deal store and passes a serializable `Deal` down. The interactive children (AG Grid, antd Tabs, the drawer) are client components. This split keeps the initial HTML lightweight and avoids passing render functions across the server/client boundary (a real bug we hit and fixed mid-build).

**Tailwind v4 alongside Ant Design, not instead of.** Tailwind handles layout/spacing/typography utilities at the page and section level. Antd handles the primitives. They coexist cleanly because antd v6 uses CSS-in-JS (no global stylesheet conflicts).

**Realistic mock data, not Lorem Ipsum.** The 8 deals in `lib/data.ts` use plausible direct-lending economics: 4–6x leverage, S+550 to S+700 spreads, mid-market EBITDA scale, real sponsor archetypes (LBO / refi / acq financing / divrecap / growth), real workstream owners (KPMG, Latham, L.E.K., Bain, Marsh, PwC). When a credit professional looks at the deal page, the numbers should pass a sniff test in 3 seconds.

---

## 3. Data model

### Why one `Deal` aggregate

I model the workspace around a single `Deal` aggregate that owns everything the UI ever needs to render about that deal — financials, capital structure, diligence, risks, terms, covenants, sponsor, thesis. There is no separate "deal header" object, "deal financials" object, etc.

This shape was picked for three reasons:

1. **The IC memo template stays trivial.** `buildMemo(deal: Deal): string` reads every section it needs off one object and writes it out. If financials lived in their own service, the memo generator would need joins, fetches, and null-handling. Here it's `deal.financials.map(...)`.
2. **Pages and grids become dumb renderers.** `app/page.tsx` is `<PipelineGrid>`. The grid renders `deals: Deal[]`. The deal page renders `deal: Deal`. There's no client-side merging of related entities.
3. **It models how a deal team thinks.** When an analyst says "the Atlas deal," they mean every fact about Atlas — not "the deal record joined to the diligence schedule joined to the cap stack." Storage shape ≠ domain shape.

In a real backend each of these nested arrays becomes its own table (`tranches`, `dd_items`, `risks`, `covenants`, `financial_periods`) joined to a `deals` table — but the API layer should still hydrate one `Deal` aggregate per request to keep the front-end simple.

### Top-level `Deal` fields

```ts
interface Deal {
  id: string;                       // route param: /deals/:id
  code: string;                     // human-friendly: "PROJ-MERIDIAN"
  borrowerName: string;
  description: string;              // 1-2 sentences for the deal page header
  sector: Sector;                   // Healthcare | Software | Industrials |
                                    //   Consumer | Business Services |
                                    //   Financial Services
  geography: string;                // free text — "United States (Southeast)"
  stage: DealStage;                 // Sourcing | Screening | IOI |
                                    //   Diligence | IC Review | Closed | Passed
  sponsor: Sponsor;                 // see below
  useOfProceeds: UseOfProceeds;     // LBO | Refinancing |
                                    //   Acquisition Financing |
                                    //   Dividend Recap | Growth Capital

  // headline economics — pre-computed for grid/header speed
  totalDealSizeMM: number;          // total transaction size, $MM
  ourCommitmentMM: number;          // our hold across all tranches, $MM
  ltmRevenue: number;               // duplicated from financials for grid speed
  ltmEbitda: number;
  totalLeverage: number;            // total debt / LTM EBITDA
  seniorLeverage: number;           // senior debt / LTM EBITDA
  ltv: number;                      // loan-to-value, %
  fixedChargeCoverage: number;      // EBITDA - capex / fixed charges
  blendedYield: number;             // weighted avg yield across our hold, %
  blendedSpread: number;            // weighted avg spread, bps

  // related collections
  financials: FinancialPeriod[];
  capitalStructure: Tranche[];
  diligence: DDItem[];
  risks: Risk[];
  keyTerms: { label: string; value: string }[];
  covenants: { name: string; threshold: string; cushion?: string }[];

  // workflow metadata
  expectedClose: string;            // ISO date
  leadAnalyst: string;
  thesis: string;                   // paragraph for the Overview tab
}
```

A note on the duplication: `ltmRevenue`, `ltmEbitda`, `totalLeverage`, etc. are also derivable from `financials` and `capitalStructure`. They're stored on the top level deliberately — the pipeline grid renders 30+ rows × 6+ headline metrics; computing those from nested arrays per row would be wasted work. In production this is what materialized columns or a denormalized summary table give you.

### `Sponsor`

```ts
interface Sponsor {
  name: string;                     // "Westview Capital Partners IV"
  type: "Sponsor-backed" | "Founder-led" | "Public";
  fundSize?: number;                // $MM, only for Sponsor-backed
}
```

Just enough for the deal header and the IC memo's exec summary. The `type` discriminator drives a few UI decisions (e.g., founder-led deals don't show a fund size). A real model would carry track record, prior LP relationships, sector focus, and recent dry-powder estimates — all skipped here.

### `FinancialPeriod` — the financials array

```ts
interface FinancialPeriod {
  label: string;                    // "FY22" | "FY23" | "LTM" | "FY24E"
  revenue: number;                  // $MM
  ebitda: number;                   // $MM
  ebitdaMargin: number;             // %
}
```

A flat row per period. Why an array of typed labels instead of `{ fy22: …, fy23: …, ltm: … }`?

- **Period sets vary by deal.** Some deals only have LTM + management projections; some have 3 years of audited history. An array handles both cleanly.
- **Renders directly into a grid.** The Overview tab's "Historical & Projected Financials" table is one line: `<DataGrid rowData={deal.financials} />`.
- **The memo iterates with `.map()`.** No hard-coded period names in the template.

What's intentionally missing: working capital, capex, free cash flow, debt schedule, projected covenants. A real underwriting model carries 30+ line items per period and 3+ scenarios (base / upside / downside). This carries 3 — that's enough to demo the section but not enough to underwrite.

### `Tranche` — the capital structure array

```ts
interface Tranche {
  id: string;
  name: string;                     // "Senior Secured Unitranche"
  type:
    | "Revolver"
    | "Term Loan A" | "Term Loan B"
    | "Unitranche"
    | "Second Lien" | "Mezzanine" | "PIK Note"
    | "Equity";
  amountMM: number;                 // tranche size
  rate: string;                     // "S+625" or "12.0% Cash + 3.0% PIK"
  floor?: string;                   // SOFR floor, e.g. "1.00%"
  oid?: string;                     // original issue discount, e.g. "2.00%"
  maturityYears: number;
  seniority: number;                // 1 = most senior; equity = 99
  ourHoldMM?: number;               // amount we are committing in this tranche
  call?: string;                    // call schedule, e.g. "NC1, 102, 101"
}
```

This was the most considered subtype. Private credit deal teams think in tranches — a deal is a stack of tranches with different priorities, pricing, and protections. Decisions made here:

- **Equity is a tranche.** It has no rate or call, but treating equity as `Tranche` with `type: "Equity"` means the capital-stack visualization, the Sources of Capital grid, and the % of total cap calculations all iterate over a single array. No special-casing.
- **`rate` is a string, not a number.** Real pricing isn't a single number — it's "S+625, 1% floor, 2% OID" or "12% cash + 3% PIK." Stringly-typed. We store the components separately (`floor`, `oid`) for cases where we need them, but the headline display is `rate`.
- **`seniority: number` instead of an enum.** Lets us sort the cap stack with `[...].sort((a,b) => a.seniority - b.seniority)` and use `99` as a sentinel for equity. An enum would force lookups every time we want to sort.
- **`ourHoldMM` is per-tranche.** Big deals span multiple tranches and we may hold different amounts in each. Aggregating to `Deal.ourCommitmentMM` happens at the Deal level (and is also stored top-level for grid speed, per the duplication note above).
- **Cumulative leverage is computed, not stored.** The Securities tab shows "cumul. lev." per tranche — that's `cumulativeDebt / ltmEbitda` summed top-down. Storing it would make every tranche edit a multi-row update.

Skipped: amortization schedule, MFN baskets, ECF sweep mechanics, prepayment economics. All would matter in production; none matter for the demo.

### `DDItem` — the diligence array

```ts
type DDStatus = "Not Started" | "In Progress" | "Complete" | "Flagged";

interface DDItem {
  id: string;
  workstream:
    | "Financial" | "Legal" | "Commercial"
    | "Operational" | "ESG" | "Tax" | "Insurance";
  task: string;                     // "QofE review (Alvarez & Marsal)"
  owner: string;                    // "S. Park" or "Latham"
  status: DDStatus;
  dueDate: string;                  // ISO date
  notes?: string;                   // surfaced in IC memo for "Flagged" items
}
```

A flat list. The Diligence tab groups by `workstream` for the per-section grids and bins by `dueDate` for the calendar view. Both are derived at render time:

```ts
const byWorkstream = items.filter((d) => d.workstream === "Financial");
const itemsByDay   = items.reduce((m, i) => /* bin by date */ m, new Map());
```

`workstream` is a closed enum because the seven categories are industry-standard for credit underwriting — a Tax workstream and an ESG workstream are real things on the deal calendar, and the team would push back if we let people invent new categories. `status: "Flagged"` is treated specially: the IC memo template scans for flagged items and lists them in the diligence section so they don't get buried.

Skipped: file attachments per task, comment threads, dependency edges between tasks, owner email lookups. The notes drawer is the closest stand-in for a comment thread.

### `Risk` — the risks array

```ts
interface Risk {
  category: "Credit" | "Market" | "Operational" | "ESG" | "Legal";
  severity: "Low" | "Medium" | "High";
  description: string;
  mitigant?: string;
}
```

Risks are paired with mitigants because that's how credit memos read — never raise a risk without addressing it. The IC memo template enforces the pairing in its rendering loop. `severity` drives the colored badge in the risks grid (green/gold/red Tag) and could drive sorting; `category` is closed because IC's risk taxonomy is fixed.

### `keyTerms` and `covenants` — the open-shape stragglers

```ts
keyTerms: { label: string; value: string }[];
covenants: { name: string; threshold: string; cushion?: string }[];
```

These are deliberately the loosest types. Term sheets vary so much across deals (an LBO has different headline terms than a divrecap) that any closed schema would fight reality. `keyTerms` is just a labelled list — analyst writes the label, analyst writes the value, the Overview tab renders it as a `<Descriptions>`. `covenants` is slightly more structured because the cushion-vs-base-case framing is universal.

If a future iteration wanted automated covenant compliance tracking against quarterly reporting, `threshold` would need to become structured (`{ metric: string, op: "≤"|"≥", value: number }`). Today it's free text — fine for display, useless for computation.

### What lives only on the deal page (not the type)

- **Notes** — the Add-Note drawer keeps notes in component state. They'd belong on the `Deal` (or a related `notes: Note[]`) in production but they're ephemeral demo state today.
- **Stage transitions / audit log** — when "Submit to IC" succeeds in the demo it just flips a local boolean. In production this writes a row to a `deal_events` table and changes `Deal.stage`.
- **Sensitivity** — the −20% EBITDA stress on the Capital Structure tab is computed inline, not stored. A real model would persist named scenarios.

### Where this breaks down

The single-aggregate model breaks if:
- You need cross-deal queries that don't fit a SQL `where` (e.g., "show me every diligence item across the portfolio that's flagged"). You'd want a `dd_items` table indexed by status, not a `deals.dd_items[]` array.
- Multiple users edit different sections of the same deal concurrently. Section-level optimistic concurrency is awkward when the whole deal is the unit.
- Diligence items get heavy enough (file attachments, comment threads) that loading them eagerly with the deal becomes wasteful.

For an underwriting workspace at the size a private credit fund actually runs (dozens of deals in flight, not thousands), the aggregate works.

### How the IC memo consumes the model

`lib/memo.ts` exports `buildMemo(deal: Deal): string`. It interpolates typed fields into template-literal blocks for each section and joins repeating items (tranches, risks, diligence) with `Array.map().join("\n")`. Deterministic — same `Deal` always produces the same memo. No regex, no parsing, no LLM. In production the entry point stays the same; the body becomes a structured-output LLM call that takes the same `Deal` and returns a richer narrative with citations.

---

## 4. Tradeoffs — what's mocked, simplified, or skipped

**Mocked**
- 8 hand-built deals (`lib/data.ts`) covering every pipeline stage, sponsor type, sector, and use-of-proceeds we wanted to show. Numbers are realistic for direct lending — leverage 4–6x, S+550 to S+700 spreads, mid-market EBITDA scale.
- The IC memo is generated from a deterministic template. It reads real fields off the deal and writes a structured memo. **No LLM** — the template is what's in production-grade tools today (e.g., DealCloud, Pitchbook), and it's fully reviewable.
- "Add Note" appends to client state and disappears on reload. Categories and the seed history are mocked.
- Sector spread trends and market comps in `/markets` are hand-curated for plausibility.
- Edit buttons surface a toast — they signal where inline editors would attach in production.

**Simplified**
- One-day historical state. No audit trail, no version history, no "who changed what".
- No auth, no multi-tenancy. Single fund (Westview Direct Lending Fund IV) hardcoded.
- No real-time anything. No WebSocket diligence updates, no co-authoring.
- −20% EBITDA stress is computed inline in the Capital Structure tab. A real underwriting model takes 3–6 sensitivity scenarios with full debt schedule run-out.
- Diligence calendar is a static 5-week month grid. No drag-to-reschedule.

**Explicitly skipped**
- Document storage / data room integration (Datasite, Intralinks).
- Loan accounting (interest accruals, mark-to-market, covenant compliance reporting).
- Portfolio-level surveillance (covenant tripping alerts, watchlist).
- Email / Slack / Outlook integration.
- Investor reporting / LP capital calls.
- Comparable transactions sourced from market data (LCD, Refinitiv).

The cut line was: **anything that needs a backend integration is a stub or absent**. The UX primitives that a deal team touches every day are real.

---

## 5. With another two days

**Day 1 — make the demo defensible to power users**
- Wire a real `Deal` server (Postgres + Drizzle, schema mirrors `lib/types.ts`). Every grid is already a thin renderer over an array — swap the source.
- Build a CIM upload + extractor. Drop a PDF into a deal, run a parser (probabilistic field extraction backed by a structured-output LLM call), populate the deal record. The fields are already enumerated; this is where the AI value compounds.
- Auth + roles (Analyst / Principal / IC Member / Admin). Notes, memo edits, and stage transitions become attributable and audit-logged.
- Diligence calendar gains drag-to-reschedule and ICS export. Each workstream item gets a comment thread keyed off the same notes drawer pattern.

**Day 2 — close the loop with the broader workflow**
- IC memo gains a structured editor (each section is its own field), sponsor-style citations linking back to diligence items and financials, and a side-by-side compare against the last memo this analyst submitted. Versioned.
- Portfolio surveillance: pull quarterly reporting (mocked CSV upload), compare to base case, alert when a covenant cushion narrows below threshold.
- Market comps populated from a real source (LCD or a scraped public-deal feed) with sector and tranche-type filters that actually filter the comp set.
- "Submit to IC" actually does something — generates the agenda packet, emails IC members with the deal score and pre-read, and tracks votes inline. This is the workflow the existing nav is shaped for.
- One-page printable IC packet (PDF) per deal; this is what gets emailed when the demo lands.

Beyond that, the longer-tail items are integrations (Salesforce / DealCloud import, Outlook calendar sync, Datasite folder mirroring) — none of which change the UX, all of which determine whether the team adopts it.
