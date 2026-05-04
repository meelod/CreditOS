# CreditOS — Private Credit Underwriting Workspace

A prototype underwriting workspace for a direct-lending team — pipeline tracking, deal detail with capital structure, due diligence management, and IC memo generation.

Run with `pnpm install && pnpm dev` (Node 20+). No external services required.

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

Rendering: most deal pages are client components (AG Grid + interactive
filters/tabs/drawer). The deal route itself is a server component that
loads from the static deal store and passes a serializable Deal down.
generateStaticParams pre-renders every deal page at build.
```

The "everything is one grid wrapper" decision was deliberate. Once `DataGrid.tsx` exists, every dataset on the deal page (financials, risks, tranches, diligence) gets the same theme, the same sort/filter/resize behaviour, and the same tabular numerals — no surprises for an Excel-native user.

---

## 3. Data model

A single `Deal` aggregate holds everything the UI needs:

```ts
Deal {
  id, code, borrowerName, description
  sector, geography, stage          // Sourcing | Screening | IOI |
                                    // Diligence | IC Review | Closed | Passed
  sponsor: { name, type, fundSize }
  useOfProceeds                     // LBO | Refi | Acquisition | Recap | Growth
  totalDealSizeMM, ourCommitmentMM
  financials: FinancialPeriod[]     // FY22 / FY23 / LTM / FY24E
  ltmRevenue, ltmEbitda
  totalLeverage, seniorLeverage, ltv, fixedChargeCoverage
  blendedYield, blendedSpread       // %, bps
  capitalStructure: Tranche[]       // Revolver, TLB, Unitranche, 2L,
                                    //   Mezz, PIK, Equity (with rate,
                                    //   floor, OID, call schedule, hold)
  diligence: DDItem[]               // workstream, task, owner, status,
                                    //   dueDate, notes
  risks: Risk[]                     // category, severity, description,
                                    //   mitigant
  keyTerms: { label, value }[]
  covenants: { name, threshold, cushion }[]
  expectedClose, leadAnalyst, thesis
}
```

This shape was picked to make the IC memo template (`lib/memo.ts`) trivial to render — every section the memo needs already lives on the `Deal`. In a real backend, each of these arrays becomes its own table joined to a deals table; the prototype keeps the join collapsed for speed.

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
