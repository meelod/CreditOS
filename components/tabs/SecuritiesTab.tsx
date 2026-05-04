"use client";
import { Card, Tag, Typography, Row, Col, Descriptions } from "antd";
import type { ColDef } from "ag-grid-community";
import type { Deal, Tranche } from "@/lib/types";
import { formatCurrency, formatMultiple } from "@/lib/utils";
import { DataGrid } from "../DataGrid";
import { EditButton } from "../EditButton";

const trancheColor: Record<string, string> = {
  Revolver: "default",
  "Term Loan A": "blue",
  "Term Loan B": "blue",
  Unitranche: "geekblue",
  "Second Lien": "gold",
  Mezzanine: "gold",
  "PIK Note": "gold",
  Equity: "green",
};

interface TrancheRow extends Tranche {
  pctOfCap: number;
  cumulLev: number | null;
}

export function SecuritiesTab({ deal }: { deal: Deal }) {
  if (deal.capitalStructure.length === 0) {
    return (
      <Card size="small">
        <Typography.Text type="secondary">
          Capital structure not yet finalized at this stage.
        </Typography.Text>
      </Card>
    );
  }

  const totalCap =
    deal.capitalStructure.reduce((s, t) => s + t.amountMM, 0) || 1;
  const equity = deal.capitalStructure.find((t) => t.type === "Equity");
  const equityCushionPct = equity ? (equity.amountMM / totalCap) * 100 : 0;
  const totalDebt = deal.capitalStructure
    .filter((t) => t.type !== "Equity")
    .reduce((s, t) => s + t.amountMM, 0);

  let cumulativeDebt = 0;
  const rows: TrancheRow[] = deal.capitalStructure.map((t) => {
    const isDebt = t.type !== "Equity";
    if (isDebt) cumulativeDebt += t.amountMM;
    return {
      ...t,
      pctOfCap: (t.amountMM / totalCap) * 100,
      cumulLev: isDebt && deal.ltmEbitda ? cumulativeDebt / deal.ltmEbitda : null,
    };
  });

  const cols: ColDef<TrancheRow>[] = [
    {
      field: "name",
      headerName: "Tranche",
      flex: 1.4,
      minWidth: 220,
      cellRenderer: (p: { data: TrancheRow }) => (
        <div style={{ lineHeight: 1.3, paddingTop: 2 }}>
          <div style={{ fontWeight: 600, color: "#0f172a" }}>{p.data.name}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Seniority {p.data.seniority}</div>
        </div>
      ),
    },
    {
      field: "type",
      headerName: "Type",
      width: 130,
      cellRenderer: (p: { value: string }) => (
        <Tag color={trancheColor[p.value] ?? "default"}>{p.value}</Tag>
      ),
    },
    {
      field: "amountMM",
      headerName: "Amount",
      width: 110,
      type: "numericColumn",
      cellClass: "ag-right-aligned-cell",
      valueFormatter: (p) => formatCurrency(p.value as number),
    },
    {
      field: "pctOfCap",
      headerName: "% of Cap",
      width: 100,
      type: "numericColumn",
      cellClass: "ag-right-aligned-cell",
      valueFormatter: (p) => `${(p.value as number).toFixed(0)}%`,
    },
    {
      field: "cumulLev",
      headerName: "Cumul. Lev.",
      width: 120,
      type: "numericColumn",
      cellClass: "ag-right-aligned-cell",
      valueFormatter: (p) => (p.value !== null ? formatMultiple(p.value as number) : "—"),
    },
    {
      headerName: "Pricing",
      flex: 1,
      minWidth: 160,
      cellRenderer: (p: { data: TrancheRow }) => (
        <div style={{ lineHeight: 1.3, paddingTop: 2 }}>
          <div style={{ fontFamily: "monospace", fontWeight: 500 }}>{p.data.rate}</div>
          {p.data.floor || p.data.oid ? (
            <div style={{ fontSize: 11, color: "#64748b" }}>
              {p.data.floor ? `Floor ${p.data.floor}` : null}
              {p.data.floor && p.data.oid ? " · " : null}
              {p.data.oid ? `OID ${p.data.oid}` : null}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      field: "maturityYears",
      headerName: "Maturity",
      width: 100,
      valueFormatter: (p) => (p.value ? `${p.value}yr` : "—"),
    },
    { field: "call", headerName: "Call", flex: 1, minWidth: 140, valueFormatter: (p) => (p.value as string) ?? "—" },
    {
      field: "ourHoldMM",
      headerName: "Our Hold",
      width: 110,
      type: "numericColumn",
      cellClass: "ag-right-aligned-cell",
      valueFormatter: (p) => (p.value ? formatCurrency(p.value as number) : "—"),
    },
  ];

  return (
    <div className="space-y-4">
      <Card
        title="Sources of Capital"
        size="small"
        extra={
          <Typography.Text type="secondary" style={{ fontSize: 11, marginRight: 8 }}>
            Total: {formatCurrency(totalCap)} · Debt: {formatCurrency(totalDebt)} ·
            Equity Cushion: {equityCushionPct.toFixed(0)}%
          </Typography.Text>
        }
        styles={{ body: { padding: 0 } }}
      >
        <DataGrid<TrancheRow> rowData={rows} columnDefs={cols} />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card title="Capital Stack" size="small">
            <div className="space-y-2">
              {rows.map((t) => (
                <div key={t.id}>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "#334155", fontWeight: 500 }}>
                      {t.name}
                    </span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatCurrency(t.amountMM)}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 22,
                      width: "100%",
                      background: "#f1f5f9",
                      borderRadius: 3,
                      overflow: "hidden",
                      marginTop: 2,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${t.pctOfCap}%`,
                        background:
                          t.type === "Equity"
                            ? "#10b981"
                            : t.type === "Second Lien" ||
                                t.type === "Mezzanine"
                              ? "#f59e0b"
                              : "#6366f1",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    {t.pctOfCap.toFixed(0)}% of capital
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Our Position" size="small" extra={<EditButton section="position" />}>
            <Descriptions column={1} size="small" colon={false}>
              <Descriptions.Item label="Total Commitment">
                {formatCurrency(deal.ourCommitmentMM)}
              </Descriptions.Item>
              <Descriptions.Item label="% of Capital Stack">
                {((deal.ourCommitmentMM / totalCap) * 100).toFixed(1)}%
              </Descriptions.Item>
              <Descriptions.Item label="Senior Lev.">
                {formatMultiple(deal.seniorLeverage)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Lev.">
                {formatMultiple(deal.totalLeverage)}
              </Descriptions.Item>
              <Descriptions.Item label="LTV">
                {deal.ltv ? `${deal.ltv}%` : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Blended Yield">
                <span style={{ color: "#047857", fontWeight: 600 }}>
                  {deal.blendedYield.toFixed(2)}%
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Spread">
                S+{deal.blendedSpread}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Sensitivity (EBITDA −20%)" size="small">
            <Descriptions column={1} size="small" colon={false}>
              <Descriptions.Item label="Stressed EBITDA">
                {formatCurrency(deal.ltmEbitda * 0.8)}
              </Descriptions.Item>
              <Descriptions.Item label="Stressed Lev.">
                {formatMultiple(deal.totalLeverage / 0.8)}
              </Descriptions.Item>
              <Descriptions.Item label="Cov. Cushion">
                {Math.max(
                  0,
                  ((6.5 - deal.totalLeverage / 0.8) / 6.5) * 100,
                ).toFixed(0)}
                %
              </Descriptions.Item>
              <Descriptions.Item label="Stressed LTV">
                {deal.ltv ? `${(deal.ltv / 0.8).toFixed(0)}%` : "—"}
              </Descriptions.Item>
            </Descriptions>
            <Typography.Paragraph
              type="secondary"
              style={{ fontSize: 11, marginTop: 8, marginBottom: 0 }}
            >
              Assumes 20% EBITDA decline, no de-leveraging, flat enterprise value.
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
