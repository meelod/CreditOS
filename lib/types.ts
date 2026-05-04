export type DealStage =
  | "Sourcing"
  | "Screening"
  | "IOI"
  | "Diligence"
  | "IC Review"
  | "Closed"
  | "Passed";

export type Sector =
  | "Healthcare"
  | "Software"
  | "Industrials"
  | "Consumer"
  | "Business Services"
  | "Financial Services";

export type UseOfProceeds =
  | "LBO"
  | "Refinancing"
  | "Acquisition Financing"
  | "Dividend Recap"
  | "Growth Capital";

export interface Sponsor {
  name: string;
  type: "Sponsor-backed" | "Founder-led" | "Public";
  fundSize?: number; // in $MM
}

export interface Tranche {
  id: string;
  name: string;
  type:
    | "Revolver"
    | "Term Loan A"
    | "Term Loan B"
    | "Unitranche"
    | "Second Lien"
    | "Mezzanine"
    | "PIK Note"
    | "Equity";
  amountMM: number;
  rate: string; // e.g. "S+550" or "12.0% Cash + 3.0% PIK"
  floor?: string; // SOFR floor
  oid?: string; // original issue discount
  maturityYears: number;
  seniority: number; // 1 = most senior
  ourHoldMM?: number; // amount we are committing
  call?: string; // e.g. "NC1, 102, 101"
}

export type DDStatus = "Not Started" | "In Progress" | "Complete" | "Flagged";

export interface DDItem {
  id: string;
  workstream:
    | "Financial"
    | "Legal"
    | "Commercial"
    | "Operational"
    | "ESG"
    | "Tax"
    | "Insurance";
  task: string;
  owner: string;
  status: DDStatus;
  dueDate: string; // ISO
  notes?: string;
}

export interface FinancialPeriod {
  label: string; // "FY22", "FY23", "FY24E", "LTM"
  revenue: number; // $MM
  ebitda: number; // $MM
  ebitdaMargin: number; // %
}

export interface Risk {
  category: "Credit" | "Market" | "Operational" | "ESG" | "Legal";
  severity: "Low" | "Medium" | "High";
  description: string;
  mitigant?: string;
}

export interface Deal {
  id: string;
  code: string; // e.g. "PROJ-MERIDIAN"
  borrowerName: string;
  description: string;
  sector: Sector;
  geography: string;
  stage: DealStage;
  sponsor: Sponsor;
  useOfProceeds: UseOfProceeds;
  totalDealSizeMM: number;
  ourCommitmentMM: number;
  financials: FinancialPeriod[];
  ltmEbitda: number;
  ltmRevenue: number;
  totalLeverage: number; // Total Debt / EBITDA
  seniorLeverage: number;
  ltv: number; // Loan-to-Value, %
  fixedChargeCoverage: number;
  blendedYield: number; // %
  blendedSpread: number; // bps
  capitalStructure: Tranche[];
  diligence: DDItem[];
  risks: Risk[];
  keyTerms: { label: string; value: string }[];
  covenants: { name: string; threshold: string; cushion?: string }[];
  expectedClose: string; // ISO
  leadAnalyst: string;
  thesis: string;
}
