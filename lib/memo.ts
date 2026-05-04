import type { Deal } from "./types";
import { formatCurrency, formatMultiple, formatPercent, formatDate } from "./utils";

export function buildMemo(deal: Deal): string {
  const totalCap = deal.capitalStructure.reduce((s, t) => s + t.amountMM, 0);
  const equity = deal.capitalStructure.find((t) => t.type === "Equity");
  const equityCushionPct = equity && totalCap ? (equity.amountMM / totalCap) * 100 : 0;
  const seniorTranche = deal.capitalStructure.find(
    (t) =>
      t.type === "Unitranche" ||
      t.type === "Term Loan A" ||
      t.type === "Term Loan B",
  );

  const ltm = deal.financials.find((f) => f.label === "LTM");
  const fy23 = deal.financials.find((f) => f.label === "FY23");
  const ebitdaGrowth = ltm && fy23 ? ((ltm.ebitda - fy23.ebitda) / fy23.ebitda) * 100 : 0;
  const marginExpansion = ltm && fy23 ? ltm.ebitdaMargin - fy23.ebitdaMargin : 0;

  return `INVESTMENT COMMITTEE MEMO — ${deal.code}
Borrower: ${deal.borrowerName}
Sector: ${deal.sector} · ${deal.geography}
Date: ${formatDate(new Date().toISOString())}
Lead Analyst: ${deal.leadAnalyst}
Recommendation: APPROVE — ${formatCurrency(deal.ourCommitmentMM)} commitment

═══════════════════════════════════════════════════════
1. EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════

We are seeking IC approval for a ${formatCurrency(deal.ourCommitmentMM)} commitment in ${deal.borrowerName} ("the Company"), a ${deal.sector.toLowerCase()} business based in ${deal.geography}. The transaction is a ${deal.useOfProceeds.toLowerCase()} of the Company sponsored by ${deal.sponsor.name}, a ${deal.sponsor.type.toLowerCase()} firm${deal.sponsor.fundSize ? ` managing a ${formatCurrency(deal.sponsor.fundSize, { compact: true })} fund` : ""}.

${deal.thesis}

Headline metrics:
  • LTM Revenue: ${formatCurrency(deal.ltmRevenue)}
  • LTM EBITDA: ${formatCurrency(deal.ltmEbitda)} (${ltm ? formatPercent(ltm.ebitdaMargin, 1) : "—"} margin)
  • Total Leverage: ${formatMultiple(deal.totalLeverage)} · Senior Leverage: ${formatMultiple(deal.seniorLeverage)}
  • Loan-to-Value: ${deal.ltv ? `${deal.ltv}%` : "n/a"}
  • Fixed Charge Coverage: ${deal.fixedChargeCoverage ? formatMultiple(deal.fixedChargeCoverage) : "n/a"}
  • Blended Yield: ${formatPercent(deal.blendedYield, 2)} (S+${deal.blendedSpread})
  • Equity Cushion: ${equityCushionPct.toFixed(0)}% of total capitalization

═══════════════════════════════════════════════════════
2. COMPANY & TRANSACTION OVERVIEW
═══════════════════════════════════════════════════════

${deal.description}

The proposed financing supports a ${deal.useOfProceeds.toLowerCase()} with total transaction size of ${formatCurrency(deal.totalDealSizeMM)}. Our ${formatCurrency(deal.ourCommitmentMM)} commitment represents ${((deal.ourCommitmentMM / deal.totalDealSizeMM) * 100).toFixed(0)}% of the transaction${seniorTranche ? `, anchored in the ${seniorTranche.name} priced at ${seniorTranche.rate}` : ""}.

═══════════════════════════════════════════════════════
3. FINANCIAL PERFORMANCE
═══════════════════════════════════════════════════════

${deal.financials
  .map(
    (f) =>
      `  ${f.label.padEnd(8)}  Revenue: ${("$" + f.revenue.toFixed(1) + "MM").padEnd(12)}  EBITDA: ${("$" + f.ebitda.toFixed(1) + "MM").padEnd(12)}  Margin: ${formatPercent(f.ebitdaMargin, 1)}`,
  )
  .join("\n")}

${
  fy23 && ltm
    ? `EBITDA grew ${ebitdaGrowth.toFixed(0)}% from FY23 to LTM, with margin expansion of ${marginExpansion >= 0 ? "+" : ""}${marginExpansion.toFixed(1)} pts driven by operating leverage and pricing initiatives.`
    : ""
}

═══════════════════════════════════════════════════════
4. CAPITAL STRUCTURE & PRICING
═══════════════════════════════════════════════════════

${
  deal.capitalStructure.length > 0
    ? deal.capitalStructure
        .map(
          (t) =>
            `  ${t.name.padEnd(34)}${("$" + t.amountMM + "MM").padEnd(10)}${t.rate.padEnd(14)}  ${t.maturityYears ? t.maturityYears + "yr" : "—"}`,
        )
        .join("\n")
    : "  (capital structure to be finalized)"
}

Total Capitalization: ${formatCurrency(totalCap)}
Equity Cushion: ${formatCurrency(equity?.amountMM ?? 0)} (${equityCushionPct.toFixed(0)}% of cap)

Our commitment is anchored at ${formatMultiple(deal.seniorLeverage)} senior / ${formatMultiple(deal.totalLeverage)} total leverage with ${deal.ltv ? `${deal.ltv}% LTV` : "comparable LTV protection"}.

═══════════════════════════════════════════════════════
5. KEY TERMS & DOCUMENTATION
═══════════════════════════════════════════════════════

${
  deal.keyTerms.length > 0
    ? deal.keyTerms
        .map((t) => `  • ${t.label}: ${t.value}`)
        .join("\n")
    : "  (terms under negotiation)"
}

Financial covenants:
${
  deal.covenants.length > 0
    ? deal.covenants
        .map((c) => `  • ${c.name}: ${c.threshold}${c.cushion ? ` (${c.cushion})` : ""}`)
        .join("\n")
    : "  (covenant package TBD)"
}

═══════════════════════════════════════════════════════
6. KEY RISKS & MITIGANTS
═══════════════════════════════════════════════════════

${
  deal.risks.length > 0
    ? deal.risks
        .map(
          (r, i) =>
            `${i + 1}. ${r.category.toUpperCase()} (${r.severity}): ${r.description}\n   Mitigant: ${r.mitigant ?? "Under further review."}`,
        )
        .join("\n\n")
    : "Risks have not yet been documented."
}

═══════════════════════════════════════════════════════
7. DUE DILIGENCE STATUS
═══════════════════════════════════════════════════════

${
  deal.diligence.length > 0
    ? (() => {
        const total = deal.diligence.length;
        const done = deal.diligence.filter((d) => d.status === "Complete").length;
        const flagged = deal.diligence.filter((d) => d.status === "Flagged");
        return `Workstream completion: ${done} of ${total} (${Math.round((done / total) * 100)}%).${
          flagged.length > 0
            ? `\n\nItems flagged for IC attention:\n${flagged.map((f) => `  • [${f.workstream}] ${f.task}: ${f.notes ?? "see diligence detail"}`).join("\n")}`
            : "\n\nNo open items flagged for IC review."
        }`;
      })()
    : "Diligence has not yet been initiated."
}

═══════════════════════════════════════════════════════
8. RECOMMENDATION
═══════════════════════════════════════════════════════

The investment team recommends APPROVAL of a ${formatCurrency(deal.ourCommitmentMM)} commitment to ${deal.borrowerName} on the terms outlined above.

Expected close: ${formatDate(deal.expectedClose)}.

Lead Analyst: ${deal.leadAnalyst}
`;
}
