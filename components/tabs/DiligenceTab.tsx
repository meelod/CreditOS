"use client";
import { useState, useMemo } from "react";
import {
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Progress,
  Segmented,
  Tooltip,
  Space,
} from "antd";
import {
  CheckCircleFilled,
  ClockCircleFilled,
  WarningFilled,
  MinusCircleOutlined,
  TableOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import type { ColDef } from "ag-grid-community";
import type { Deal, DDItem, DDStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { DataGrid } from "../DataGrid";
import { EditButton } from "../EditButton";

const statusColor: Record<DDStatus, string> = {
  Complete: "green",
  "In Progress": "blue",
  Flagged: "gold",
  "Not Started": "default",
};

const statusIcon: Record<DDStatus, React.ReactNode> = {
  Complete: <CheckCircleFilled style={{ color: "#10b981" }} />,
  "In Progress": <ClockCircleFilled style={{ color: "#3b82f6" }} />,
  Flagged: <WarningFilled style={{ color: "#f59e0b" }} />,
  "Not Started": <MinusCircleOutlined style={{ color: "#94a3b8" }} />,
};

const workstreams = [
  "Financial",
  "Legal",
  "Commercial",
  "Operational",
  "ESG",
  "Tax",
  "Insurance",
] as const;

const workstreamColor: Record<string, string> = {
  Financial: "#0ea5e9",
  Legal: "#8b5cf6",
  Commercial: "#10b981",
  Operational: "#f59e0b",
  ESG: "#84cc16",
  Tax: "#f43f5e",
  Insurance: "#6366f1",
};

export function DiligenceTab({ deal }: { deal: Deal }) {
  const [view, setView] = useState<"grid" | "calendar">("grid");

  if (deal.diligence.length === 0) {
    return (
      <Card size="small">
        <Typography.Text type="secondary">
          Due diligence has not yet been initiated for this deal.
        </Typography.Text>
      </Card>
    );
  }

  const total = deal.diligence.length;
  const complete = deal.diligence.filter((d) => d.status === "Complete").length;
  const flagged = deal.diligence.filter((d) => d.status === "Flagged").length;
  const inProg = deal.diligence.filter((d) => d.status === "In Progress").length;
  const pct = Math.round((complete / total) * 100);

  return (
    <div className="space-y-4">
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
              Overall Progress
            </Typography.Text>
            <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              {pct}%
            </div>
            <Progress
              percent={pct}
              showInfo={false}
              size="small"
              strokeColor="#10b981"
            />
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              {complete}/{total} complete
            </Typography.Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
              In Progress
            </Typography.Text>
            <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              {inProg}
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              Active workstreams
            </Typography.Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
              Flagged
            </Typography.Text>
            <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, fontVariantNumeric: "tabular-nums", color: flagged > 0 ? "#b45309" : undefined }}>
              {flagged}
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              Items requiring IC attention
            </Typography.Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
              Days to IC
            </Typography.Text>
            <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              9
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              Materials lock 5 days prior
            </Typography.Text>
          </Card>
        </Col>
      </Row>

      <div className="flex items-center justify-between">
        <Typography.Text strong style={{ fontSize: 13 }}>
          Diligence Workstreams
        </Typography.Text>
        <Segmented
          size="small"
          value={view}
          onChange={(v) => setView(v as "grid" | "calendar")}
          options={[
            { label: "Grid", value: "grid", icon: <TableOutlined /> },
            { label: "Calendar", value: "calendar", icon: <CalendarOutlined /> },
          ]}
        />
      </div>

      {view === "calendar" ? (
        <DiligenceCalendar items={deal.diligence} />
      ) : (
        workstreams.map((ws) => {
          const items = deal.diligence.filter((d) => d.workstream === ws);
          if (items.length === 0) return null;
          const wsComplete = items.filter((d) => d.status === "Complete").length;
          return (
            <WorkstreamCard
              key={ws}
              workstream={ws}
              items={items}
              complete={wsComplete}
            />
          );
        })
      )}
    </div>
  );
}

function WorkstreamCard({
  workstream,
  items,
  complete,
}: {
  workstream: string;
  items: DDItem[];
  complete: number;
}) {
  const cols: ColDef<DDItem>[] = [
    {
      field: "status",
      headerName: "",
      width: 40,
      cellRenderer: (p: { value: DDStatus }) => statusIcon[p.value],
    },
    { field: "task", headerName: "Workstream Item", flex: 1.5, minWidth: 280 },
    { field: "owner", headerName: "Owner", width: 130 },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      cellRenderer: (p: { value: DDStatus }) => (
        <Tag color={statusColor[p.value]}>{p.value}</Tag>
      ),
    },
    {
      field: "dueDate",
      headerName: "Due",
      width: 110,
      valueFormatter: (p) => formatDate(p.value as string),
    },
    {
      field: "notes",
      headerName: "Notes",
      flex: 1,
      minWidth: 220,
      valueFormatter: (p) => (p.value as string) ?? "—",
    },
  ];

  return (
    <Card
      title={`${workstream} Diligence`}
      size="small"
      extra={
        <Space size={8}>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            {complete}/{items.length} complete
          </Typography.Text>
          <EditButton section={`${workstream.toLowerCase()} workstream`} />
        </Space>
      }
      styles={{ body: { padding: 0 } }}
    >
      <DataGrid<DDItem> rowData={items} columnDefs={cols} />
    </Card>
  );
}

function DiligenceCalendar({ items }: { items: DDItem[] }) {
  // Build a 5-week calendar centered on the earliest due date.
  const sorted = [...items].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const minDate = useMemo(
    () => (sorted[0] ? new Date(sorted[0].dueDate) : new Date()),
    [sorted],
  );

  // Find the Sunday of the week containing the earliest item.
  const start = new Date(minDate);
  start.setDate(start.getDate() - start.getDay());

  const weeks = 5;
  const days: Date[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }

  const itemsByDay = new Map<string, DDItem[]>();
  for (const item of items) {
    const key = item.dueDate.slice(0, 10);
    if (!itemsByDay.has(key)) itemsByDay.set(key, []);
    itemsByDay.get(key)!.push(item);
  }

  const monthLabel = days[Math.floor(days.length / 2)].toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card
      title={
        <span>
          Workstream Calendar{" "}
          <Typography.Text type="secondary" style={{ fontWeight: 400, fontSize: 12 }}>
            · {monthLabel}
          </Typography.Text>
        </span>
      }
      size="small"
      extra={
        <Space size={12} style={{ fontSize: 11 }}>
          {workstreams.map((ws) => (
            <span key={ws} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: workstreamColor[ws],
                  display: "inline-block",
                }}
              />
              <span style={{ color: "#64748b" }}>{ws}</span>
            </span>
          ))}
        </Space>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: "#e2e8f0", border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden" }}>
        {dayLabels.map((d) => (
          <div
            key={d}
            style={{
              background: "#f8fafc",
              padding: "6px 10px",
              fontSize: 11,
              fontWeight: 600,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {d}
          </div>
        ))}
        {days.map((d) => {
          const key = d.toISOString().slice(0, 10);
          const dayItems = itemsByDay.get(key) ?? [];
          const isToday = d.getTime() === today.getTime();
          return (
            <div
              key={key}
              style={{
                background: isToday ? "#eef2ff" : "#fff",
                minHeight: 90,
                padding: 6,
                position: "relative",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: isToday ? 700 : 500,
                  color: isToday ? "#3730a3" : "#475569",
                  marginBottom: 4,
                }}
              >
                {d.getDate()}
                {isToday ? <span style={{ marginLeft: 4, fontSize: 9, color: "#3730a3" }}>TODAY</span> : null}
              </div>
              <div className="space-y-1">
                {dayItems.map((it) => (
                  <Tooltip
                    key={it.id}
                    title={
                      <div>
                        <div style={{ fontWeight: 600 }}>{it.task}</div>
                        <div style={{ fontSize: 11, opacity: 0.85 }}>
                          {it.workstream} · {it.owner} · {it.status}
                        </div>
                      </div>
                    }
                  >
                    <div
                      style={{
                        background: workstreamColor[it.workstream],
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: 3,
                        fontSize: 11,
                        lineHeight: 1.3,
                        cursor: "default",
                        opacity: it.status === "Complete" ? 0.55 : 1,
                        textDecoration: it.status === "Complete" ? "line-through" : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {it.task}
                      </span>
                      {it.status === "Flagged" ? (
                        <WarningFilled style={{ fontSize: 10 }} />
                      ) : null}
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
