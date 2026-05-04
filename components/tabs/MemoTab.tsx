"use client";
import { useState } from "react";
import { Button, Card, Space, Typography } from "antd";
import { DownloadOutlined, FileTextOutlined } from "@ant-design/icons";
import type { Deal } from "@/lib/types";
import { buildMemo } from "@/lib/memo";

export function MemoTab({ deal }: { deal: Deal }) {
  const [text, setText] = useState("");

  const generate = () => {
    setText(buildMemo(deal));
  };

  const download = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deal.code}-IC-Memo.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!text) {
    return (
      <Card size="small">
        <div style={{ padding: "32px 20px" }}>
          <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
            <FileTextOutlined style={{ marginRight: 6, color: "#475569" }} />
            IC Memo
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Builds a structured investment-committee memo from this deal&apos;s
            financials, capital structure, diligence status, risks, and
            covenants. Output is editable before submission.
          </Typography.Paragraph>
          <Button type="primary" onClick={generate}>
            Generate Memo
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {deal.code} · {deal.borrowerName}
        </Typography.Text>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            size="small"
            onClick={download}
          >
            Download .txt
          </Button>
          <Button size="small" onClick={generate}>
            Rebuild
          </Button>
        </Space>
      </div>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        <pre
          style={{
            margin: 0,
            padding: 20,
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: 12.5,
            lineHeight: 1.7,
            color: "#0f172a",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            background: "#fff",
            maxHeight: 720,
            overflow: "auto",
          }}
        >
          {text}
        </pre>
      </Card>
    </div>
  );
}
