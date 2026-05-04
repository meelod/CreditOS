"use client";
import { Tabs } from "antd";
import type { Deal } from "@/lib/types";
import { OverviewTab } from "./tabs/OverviewTab";
import { SecuritiesTab } from "./tabs/SecuritiesTab";
import { DiligenceTab } from "./tabs/DiligenceTab";
import { MemoTab } from "./tabs/MemoTab";

export function DealTabs({ deal }: { deal: Deal }) {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
      <Tabs
        defaultActiveKey="overview"
        size="middle"
        tabBarStyle={{ padding: "0 24px", margin: 0 }}
        items={[
          {
            key: "overview",
            label: "Overview",
            children: (
              <div style={{ padding: 24, background: "#f8fafc" }}>
                <OverviewTab deal={deal} />
              </div>
            ),
          },
          {
            key: "securities",
            label: "Capital Structure",
            children: (
              <div style={{ padding: 24, background: "#f8fafc" }}>
                <SecuritiesTab deal={deal} />
              </div>
            ),
          },
          {
            key: "diligence",
            label: "Due Diligence",
            children: (
              <div style={{ padding: 24, background: "#f8fafc" }}>
                <DiligenceTab deal={deal} />
              </div>
            ),
          },
          {
            key: "memo",
            label: "IC Memo",
            children: (
              <div style={{ padding: 24, background: "#f8fafc" }}>
                <MemoTab deal={deal} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
