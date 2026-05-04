"use client";
import { Card, Col, Row, Tag, Typography } from "antd";
import type {
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
} from "ag-grid-community";
import { DataGrid } from "@/components/DataGrid";
import type { Sector } from "@/lib/types";

interface Comp {
  id: string;
  deal: string;
  sector: Sector;
  tranche: string;
  sizeMM: number;
  spread: number; // bps
  leverage: number;
  ltv: number;
  date: string;
}

const comps: Comp[] = [
  {
    id: "1",
    deal: "PROJ-LIBRA",
    sector: "Healthcare",
    tranche: "Unitranche",
    sizeMM: 250,
    spread: 625,
    leverage: 5.2,
    ltv: 46,
    date: "2026-Q1",
  },
  {
    id: "2",
    deal: "PROJ-NOVA",
    sector: "Software",
    tranche: "Unitranche",
    sizeMM: 175,
    spread: 700,
    leverage: 5.8,
    ltv: 38,
    date: "2026-Q1",
  },
  {
    id: "3",
    deal: "PROJ-OAK",
    sector: "Industrials",
    tranche: "Term Loan B",
    sizeMM: 320,
    spread: 550,
    leverage: 4.6,
    ltv: 52,
    date: "2025-Q4",
  },
  {
    id: "4",
    deal: "PROJ-CIRRUS",
    sector: "Business Services",
    tranche: "Unitranche",
    sizeMM: 140,
    spread: 650,
    leverage: 5.1,
    ltv: 44,
    date: "2025-Q4",
  },
  {
    id: "5",
    deal: "PROJ-LARK",
    sector: "Consumer",
    tranche: "Second Lien",
    sizeMM: 60,
    spread: 875,
    leverage: 6.2,
    ltv: 58,
    date: "2025-Q4",
  },
  {
    id: "6",
    deal: "PROJ-ORION",
    sector: "Financial Services",
    tranche: "Term Loan B",
    sizeMM: 210,
    spread: 575,
    leverage: 4.3,
    ltv: 36,
    date: "2025-Q3",
  },
  {
    id: "7",
    deal: "PROJ-WILLOW",
    sector: "Healthcare",
    tranche: "Unitranche",
    sizeMM: 195,
    spread: 600,
    leverage: 5.0,
    ltv: 48,
    date: "2025-Q3",
  },
  {
    id: "8",
    deal: "PROJ-HALO",
    sector: "Software",
    tranche: "Unitranche",
    sizeMM: 130,
    spread: 725,
    leverage: 5.6,
    ltv: 41,
    date: "2025-Q3",
  },
];

const sectorColor: Record<Sector, string> = {
  Healthcare: "blue",
  Software: "purple",
  Industrials: "geekblue",
  Consumer: "orange",
  "Business Services": "cyan",
  "Financial Services": "green",
};

interface SectorTrend {
  sector: Sector;
  q2_25: number;
  q3_25: number;
  q4_25: number;
  q1_26: number;
  q2_26: number;
}

const trends: SectorTrend[] = [
  { sector: "Healthcare", q2_25: 625, q3_25: 615, q4_25: 600, q1_26: 590, q2_26: 610 },
  { sector: "Software", q2_25: 750, q3_25: 725, q4_25: 710, q1_26: 700, q2_26: 700 },
  { sector: "Industrials", q2_25: 600, q3_25: 575, q4_25: 560, q1_26: 555, q2_26: 575 },
  { sector: "Consumer", q2_25: 675, q3_25: 660, q4_25: 650, q1_26: 640, q2_26: 655 },
  {
    sector: "Business Services",
    q2_25: 660,
    q3_25: 640,
    q4_25: 625,
    q1_26: 620,
    q2_26: 635,
  },
  {
    sector: "Financial Services",
    q2_25: 600,
    q3_25: 585,
    q4_25: 575,
    q1_26: 570,
    q2_26: 585,
  },
];

const monoClass = "font-mono text-[12px]";

const fmtMM = (params: ValueFormatterParams) => {
  const v = params.value as number;
  if (v == null) return "";
  return `$${v}MM`;
};

const fmtSpread = (params: ValueFormatterParams) => {
  const v = params.value as number;
  if (v == null) return "";
  return `S+${v}`;
};

const fmtLev = (params: ValueFormatterParams) => {
  const v = params.value as number;
  if (v == null) return "";
  return `${v.toFixed(1)}x`;
};

const fmtLtv = (params: ValueFormatterParams) => {
  const v = params.value as number;
  if (v == null) return "";
  return `${v}%`;
};

const fmtBps = (params: ValueFormatterParams) => {
  const v = params.value as number;
  if (v == null) return "";
  return `+${v}`;
};

const SectorRenderer = (params: ICellRendererParams) => (
  <Tag color={sectorColor[params.value as Sector]}>{params.value}</Tag>
);

export default function MarketsPage() {
  const compCols: ColDef<Comp>[] = [
    {
      field: "deal",
      headerName: "Deal",
      width: 150,
      cellClass: monoClass,
      filter: "agTextColumnFilter",
    },
    {
      field: "sector",
      headerName: "Sector",
      width: 160,
      cellRenderer: SectorRenderer,
      filter: "agTextColumnFilter",
    },
    { field: "tranche", headerName: "Tranche", width: 130 },
    {
      field: "sizeMM",
      headerName: "Size",
      width: 100,
      type: "numericColumn",
      cellClass: `ag-right-aligned-cell ${monoClass}`,
      valueFormatter: fmtMM,
      filter: "agNumberColumnFilter",
    },
    {
      field: "spread",
      headerName: "Spread",
      width: 100,
      type: "numericColumn",
      cellClass: `ag-right-aligned-cell ${monoClass}`,
      valueFormatter: fmtSpread,
      filter: "agNumberColumnFilter",
    },
    {
      field: "leverage",
      headerName: "Lev.",
      width: 90,
      type: "numericColumn",
      cellClass: `ag-right-aligned-cell ${monoClass}`,
      valueFormatter: fmtLev,
    },
    {
      field: "ltv",
      headerName: "LTV",
      width: 85,
      type: "numericColumn",
      cellClass: `ag-right-aligned-cell ${monoClass}`,
      valueFormatter: fmtLtv,
    },
    {
      field: "date",
      headerName: "Date",
      width: 110,
      type: "numericColumn",
      cellClass: `ag-right-aligned-cell ${monoClass}`,
    },
  ];

  const trendCols: ColDef<SectorTrend>[] = [
    {
      field: "sector",
      headerName: "Sector",
      width: 170,
      cellRenderer: SectorRenderer,
      filter: "agTextColumnFilter",
    },
    {
      field: "q2_25",
      headerName: "Q2'25",
      width: 90,
      type: "numericColumn",
      cellClass: `ag-right-aligned-cell ${monoClass}`,
      valueFormatter: fmtBps,
    },
    {
      field: "q3_25",
      headerName: "Q3'25",
      width: 90,
      type: "numericColumn",
      cellClass: `ag-right-aligned-cell ${monoClass}`,
      valueFormatter: fmtBps,
    },
    {
      field: "q4_25",
      headerName: "Q4'25",
      width: 90,
      type: "numericColumn",
      cellClass: `ag-right-aligned-cell ${monoClass}`,
      valueFormatter: fmtBps,
    },
    {
      field: "q1_26",
      headerName: "Q1'26",
      width: 90,
      type: "numericColumn",
      cellClass: `ag-right-aligned-cell ${monoClass}`,
      valueFormatter: fmtBps,
    },
    {
      field: "q2_26",
      headerName: "Q2'26",
      width: 90,
      type: "numericColumn",
      cellClass: `ag-right-aligned-cell ${monoClass}`,
      valueFormatter: fmtBps,
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>
        Market Comps
      </Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card
            title="Recent Direct Lending Comps"
            size="small"
            extra={
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                Last 4 quarters
              </Typography.Text>
            }
            styles={{ body: { padding: 0 } }}
          >
            <DataGrid<Comp>
              rowData={comps}
              columnDefs={compCols}
              getRowId={(p) => p.data.id}
            />
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card
            title="Sector Spread Trends"
            size="small"
            extra={
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                Avg spread, bps
              </Typography.Text>
            }
            styles={{ body: { padding: 0 } }}
          >
            <DataGrid<SectorTrend>
              rowData={trends}
              columnDefs={trendCols}
              getRowId={(p) => p.data.sector}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
