"use client";
import { Card, Descriptions, Tag, Typography, Row, Col, Space } from "antd";
import type { ColDef } from "ag-grid-community";
import type { Deal, FinancialPeriod, Risk } from "@/lib/types";
import {
  formatCurrency,
  formatMultiple,
  formatPercent,
} from "@/lib/utils";
import { EditButton } from "../EditButton";
import { DataGrid } from "../DataGrid";

const severityColor: Record<string, string> = {
  Low: "green",
  Medium: "gold",
  High: "red",
};

export function OverviewTab({ deal }: { deal: Deal }) {
  const finCols: ColDef<FinancialPeriod>[] = [
    { field: "label", headerName: "Period", width: 110 },
    {
      field: "revenue",
      headerName: "Revenue",
      flex: 1,
      type: "numericColumn",
      cellClass: "ag-right-aligned-cell",
      valueFormatter: (p) => `$${(p.value as number).toFixed(1)}MM`,
    },
    {
      field: "ebitda",
      headerName: "EBITDA",
      flex: 1,
      type: "numericColumn",
      cellClass: "ag-right-aligned-cell",
      valueFormatter: (p) => `$${(p.value as number).toFixed(1)}MM`,
    },
    {
      field: "ebitdaMargin",
      headerName: "Margin",
      flex: 1,
      type: "numericColumn",
      cellClass: "ag-right-aligned-cell",
      valueFormatter: (p) => `${(p.value as number).toFixed(1)}%`,
    },
    {
      headerName: "Lev.",
      flex: 1,
      type: "numericColumn",
      cellClass: "ag-right-aligned-cell",
      valueGetter: (p) =>
        p.data?.label === "LTM" ? formatMultiple(deal.totalLeverage) : "—",
    },
  ];

  const riskCols: ColDef<Risk>[] = [
    {
      field: "severity",
      headerName: "Severity",
      width: 110,
      cellRenderer: (p: { value: string }) => (
        <Tag color={severityColor[p.value]}>{p.value}</Tag>
      ),
    },
    { field: "category", headerName: "Category", width: 140 },
    { field: "description", headerName: "Risk", flex: 1, wrapText: true, autoHeight: true, cellStyle: { lineHeight: "1.5", paddingTop: 6, paddingBottom: 6 } },
    { field: "mitigant", headerName: "Mitigant", flex: 1, wrapText: true, autoHeight: true, cellStyle: { lineHeight: "1.5", paddingTop: 6, paddingBottom: 6 } },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card
          title="Investment Thesis"
          size="small"
          style={{ marginBottom: 16 }}
          extra={<EditButton section="thesis" />}
        >
          <Typography.Paragraph style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
            {deal.thesis}
          </Typography.Paragraph>
        </Card>

        <Card
          title="Historical & Projected Financials"
          size="small"
          extra={
            <Space size={8}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                $ in millions
              </Typography.Text>
              <EditButton section="financials" />
            </Space>
          }
          styles={{ body: { padding: 0 } }}
          style={{ marginBottom: 16 }}
        >
          <DataGrid<FinancialPeriod>
            rowData={deal.financials}
            columnDefs={finCols}
          />
        </Card>

        <Card
          title="Key Risks & Mitigants"
          size="small"
          extra={
            <Space size={8}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                {deal.risks.length} identified
              </Typography.Text>
              <EditButton section="risks" />
            </Space>
          }
          styles={{ body: { padding: 0 } }}
        >
          {deal.risks.length === 0 ? (
            <div style={{ padding: 16 }}>
              <Typography.Text type="secondary">
                Risks not yet documented for this deal.
              </Typography.Text>
            </div>
          ) : (
            <DataGrid<Risk> rowData={deal.risks} columnDefs={riskCols} />
          )}
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card
          title="Deal Snapshot"
          size="small"
          extra={<EditButton section="snapshot" />}
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={1} size="small" colon={false}>
            <Descriptions.Item label="Use of Proceeds">{deal.useOfProceeds}</Descriptions.Item>
            <Descriptions.Item label="Sponsor Type">{deal.sponsor.type}</Descriptions.Item>
            {deal.sponsor.fundSize ? (
              <Descriptions.Item label="Fund Size">
                {formatCurrency(deal.sponsor.fundSize, { compact: true })}
              </Descriptions.Item>
            ) : null}
            <Descriptions.Item label="LTM Revenue">{formatCurrency(deal.ltmRevenue)}</Descriptions.Item>
            <Descriptions.Item label="LTM EBITDA">{formatCurrency(deal.ltmEbitda)}</Descriptions.Item>
            <Descriptions.Item label="Total Lev.">{formatMultiple(deal.totalLeverage)}</Descriptions.Item>
            <Descriptions.Item label="Senior Lev.">{formatMultiple(deal.seniorLeverage)}</Descriptions.Item>
            <Descriptions.Item label="LTV">{deal.ltv ? `${deal.ltv}%` : "—"}</Descriptions.Item>
            <Descriptions.Item label="FCC">{deal.fixedChargeCoverage ? formatMultiple(deal.fixedChargeCoverage) : "—"}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Key Terms" size="small" extra={<EditButton section="terms" />} style={{ marginBottom: 16 }}>
          {deal.keyTerms.length === 0 ? (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>Terms TBD.</Typography.Text>
          ) : (
            <Descriptions column={1} size="small" colon={false}>
              {deal.keyTerms.map((t) => (
                <Descriptions.Item key={t.label} label={t.label}>
                  {t.value}
                </Descriptions.Item>
              ))}
            </Descriptions>
          )}
        </Card>

        <Card title="Financial Covenants" size="small" extra={<EditButton section="covenants" />}>
          {deal.covenants.length === 0 ? (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>Covenant package TBD.</Typography.Text>
          ) : (
            <div className="space-y-2">
              {deal.covenants.map((c) => (
                <div
                  key={c.name}
                  style={{
                    background: "#f8fafc",
                    borderRadius: 4,
                    padding: "8px 10px",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>{c.threshold}</div>
                  {c.cushion ? (
                    <div style={{ fontSize: 11, color: "#047857", marginTop: 2 }}>
                      {c.cushion}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
}

void formatPercent;
