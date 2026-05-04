"use client";
import { Card, Col, Row, Statistic, Tag, Typography } from "antd";
import Link from "next/link";
import type {
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
} from "ag-grid-community";
import { DataGrid } from "@/components/DataGrid";
import { deals } from "@/lib/data";
import type { Deal } from "@/lib/types";
import {
  formatCurrency,
  formatPercent,
} from "@/lib/utils";

const fmtMM = (params: ValueFormatterParams) => {
  const v = params.value as number;
  if (v == null) return "";
  return `$${v.toLocaleString()}MM`;
};

const fmtMultiple = (params: ValueFormatterParams) => {
  const v = params.value as number;
  if (v == null) return "";
  return `${v.toFixed(2)}x`;
};

const fmtPctNoDigits = (params: ValueFormatterParams) => {
  const v = params.value as number;
  if (v == null) return "—";
  return `${v}%`;
};

const fmtYield = (params: ValueFormatterParams) => {
  const v = params.value as number;
  if (v == null) return "";
  return `${v.toFixed(2)}%`;
};

const fmtDate = (params: ValueFormatterParams) => {
  const v = params.value as string;
  if (!v || v === "—") return "—";
  return new Date(v).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
};

const BorrowerRenderer = (params: ICellRendererParams<Deal>) => {
  const d = params.data;
  if (!d) return null;
  return (
    <Link href={`/deals/${d.id}`} style={{ color: "#0f172a" }}>
      <div style={{ fontWeight: 500, lineHeight: 1.2 }}>{d.borrowerName}</div>
      <div
        style={{
          fontSize: 11,
          color: "#64748b",
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        }}
      >
        {d.code}
      </div>
    </Link>
  );
};

const SectorRenderer = (params: ICellRendererParams<Deal>) => (
  <Tag>{params.value}</Tag>
);

const StatusRenderer = () => <Tag color="green">Performing</Tag>;

export default function PortfolioPage() {
  const closed = deals.filter((d) => d.stage === "Closed");

  const totalFunded = closed.reduce((s, d) => s + d.ourCommitmentMM, 0);
  const positions = closed.length;
  const avgYield =
    positions > 0
      ? closed.reduce((s, d) => s + d.blendedYield, 0) / positions
      : 0;
  const avgLtv =
    positions > 0 ? closed.reduce((s, d) => s + d.ltv, 0) / positions : 0;

  const columnDefs: ColDef<Deal>[] = [
    {
      field: "borrowerName",
      headerName: "Borrower",
      flex: 2,
      minWidth: 200,
      cellRenderer: BorrowerRenderer,
      filter: "agTextColumnFilter",
    },
    {
      field: "sector",
      headerName: "Sector",
      width: 150,
      cellRenderer: SectorRenderer,
      filter: "agTextColumnFilter",
    },
    {
      field: "ourCommitmentMM",
      headerName: "Funded Amount",
      width: 140,
      type: "numericColumn",
      cellClass: "ag-right-aligned-cell",
      valueFormatter: fmtMM,
      filter: "agNumberColumnFilter",
    },
    {
      field: "totalLeverage",
      headerName: "Total Lev.",
      width: 110,
      type: "numericColumn",
      cellClass: "ag-right-aligned-cell",
      valueFormatter: fmtMultiple,
    },
    {
      field: "ltv",
      headerName: "LTV",
      width: 90,
      type: "numericColumn",
      cellClass: "ag-right-aligned-cell",
      valueFormatter: fmtPctNoDigits,
    },
    {
      field: "blendedYield",
      headerName: "Yield",
      width: 100,
      type: "numericColumn",
      cellClass: "ag-right-aligned-cell",
      valueFormatter: fmtYield,
    },
    {
      field: "expectedClose",
      headerName: "Close Date",
      width: 130,
      type: "numericColumn",
      cellClass: "ag-right-aligned-cell",
      valueFormatter: fmtDate,
    },
    {
      field: "id",
      headerName: "Status",
      width: 130,
      cellRenderer: StatusRenderer,
      sortable: false,
      filter: false,
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>
        Portfolio
      </Typography.Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Total Funded"
              value={formatCurrency(totalFunded)}
              valueStyle={{ fontSize: 20, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Positions"
              value={positions}
              valueStyle={{ fontSize: 20, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Avg Yield"
              value={formatPercent(avgYield, 2)}
              valueStyle={{ fontSize: 20, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Avg LTV"
              value={`${avgLtv.toFixed(0)}%`}
              valueStyle={{ fontSize: 20, fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Closed Positions"
        size="small"
        styles={{ body: { padding: 0 } }}
      >
        <DataGrid<Deal>
          rowData={closed}
          columnDefs={columnDefs}
          getRowId={(p) => p.data.id}
        />
      </Card>
    </div>
  );
}
