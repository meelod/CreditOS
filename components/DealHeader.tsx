"use client";
import Link from "next/link";
import { useState } from "react";
import { Tag, Typography, Descriptions, Button, Space, message } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleFilled,
  SendOutlined,
} from "@ant-design/icons";
import type { Deal } from "@/lib/types";
import {
  formatCurrency,
  formatMultiple,
  formatPercent,
  formatDate,
} from "@/lib/utils";
import { AddNoteDrawer } from "./AddNoteDrawer";

const stageColor: Record<string, string> = {
  Sourcing: "default",
  Screening: "default",
  IOI: "geekblue",
  Diligence: "blue",
  "IC Review": "gold",
  Closed: "green",
  Passed: "red",
};

export function DealHeader({ deal }: { deal: Deal }) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitToIC = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      message.success({
        content: `${deal.code} submitted to IC for review`,
        icon: <CheckCircleFilled style={{ color: "#10b981" }} />,
      });
    }, 700);
  };

  return (
    <div
      style={{
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        padding: "16px 24px 20px",
      }}
    >
      <Link href="/" className="text-xs text-slate-500 hover:text-slate-900">
        <ArrowLeftOutlined /> Pipeline
      </Link>
      <div className="mt-3 flex items-start justify-between gap-6 flex-wrap">
        <div className="flex-1 min-w-0">
          <Space size={8} wrap>
            <Typography.Text type="secondary" style={{ fontFamily: "monospace", fontSize: 12 }}>
              {deal.code}
            </Typography.Text>
            <Tag color={stageColor[deal.stage] ?? "default"} style={{ margin: 0 }}>
              {deal.stage}
            </Tag>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {deal.sector} · {deal.geography}
            </Typography.Text>
          </Space>
          <Typography.Title level={3} style={{ margin: "6px 0 4px" }}>
            {deal.borrowerName}
          </Typography.Title>
          <Typography.Paragraph
            type="secondary"
            style={{ marginBottom: 8, maxWidth: 720, fontSize: 13 }}
          >
            {deal.description}
          </Typography.Paragraph>
          <Space size={20} wrap style={{ fontSize: 12 }}>
            <span className="text-slate-500">
              <UserOutlined />{" "}
              <span className="text-slate-700 font-medium ml-1">
                {deal.leadAnalyst}
              </span>{" "}
              lead
            </span>
            <span className="text-slate-500">
              <CalendarOutlined />{" "}
              <span className="text-slate-700 font-medium ml-1">
                {formatDate(deal.expectedClose)}
              </span>{" "}
              expected close
            </span>
            <span className="text-slate-500">
              Sponsor:{" "}
              <span className="text-slate-700 font-medium">
                {deal.sponsor.name}
              </span>
            </span>
          </Space>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Space>
            <Button onClick={() => setNoteOpen(true)}>Add Note</Button>
            {submitted ? (
              <Button
                type="primary"
                disabled
                icon={<CheckCircleFilled />}
                style={{
                  background: "#ecfdf5",
                  borderColor: "#a7f3d0",
                  color: "#047857",
                }}
              >
                Submitted to IC
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={submitting}
                onClick={submitToIC}
              >
                Submit to IC
              </Button>
            )}
          </Space>
          <AddNoteDrawer
            deal={deal}
            open={noteOpen}
            onClose={() => setNoteOpen(false)}
          />
          <Descriptions
            size="small"
            colon={false}
            column={3}
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              padding: "10px 14px",
              minWidth: 460,
            }}
            labelStyle={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}
            contentStyle={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
            items={[
              { key: "size", label: "Deal Size", children: formatCurrency(deal.totalDealSizeMM) },
              { key: "hold", label: "Our Hold", children: formatCurrency(deal.ourCommitmentMM) },
              { key: "lev", label: "Total Lev.", children: formatMultiple(deal.totalLeverage) },
              { key: "ltv", label: "LTV", children: deal.ltv ? `${deal.ltv}%` : "—" },
              {
                key: "yield",
                label: "Blended Yield",
                children: (
                  <span style={{ color: "#047857" }}>
                    {formatPercent(deal.blendedYield, 2)}
                  </span>
                ),
              },
              { key: "spread", label: "Spread", children: `S+${deal.blendedSpread}` },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
