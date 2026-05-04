"use client";
import { useState } from "react";
import {
  Drawer,
  Input,
  Button,
  Select,
  Space,
  Typography,
  Tag,
  Form,
  message,
  Divider,
} from "antd";
import { PaperClipOutlined } from "@ant-design/icons";
import type { Deal } from "@/lib/types";

interface Note {
  id: string;
  category: string;
  text: string;
  author: string;
  timestamp: string;
}

const seedNotes = (deal: Deal): Note[] => [
  {
    id: "1",
    category: "Diligence",
    text: `Met with CFO on May 1. Confirmed FY24 EBITDA bridge — ~$4MM of run-rate from the November price book is now in LTM. Working capital normalization is the only meaningful adjustment in QofE.`,
    author: deal.leadAnalyst,
    timestamp: "May 1, 2026 · 4:12pm",
  },
  {
    id: "2",
    category: "Sponsor",
    text: `Sponsor agreed to MFN of 100 bps for 24 months (vs. 50/12 originally proposed). Final markup expected by Friday.`,
    author: deal.leadAnalyst,
    timestamp: "Apr 28, 2026 · 9:30am",
  },
];

const categories = ["Diligence", "Sponsor", "Legal", "IC Prep", "General"];

export function AddNoteDrawer({
  deal,
  open,
  onClose,
}: {
  deal: Deal;
  open: boolean;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState<Note[]>(() => seedNotes(deal));
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Diligence");

  const submit = () => {
    if (!text.trim()) return;
    const note: Note = {
      id: String(Date.now()),
      category,
      text: text.trim(),
      author: "Sarah Park",
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    };
    setNotes([note, ...notes]);
    setText("");
    message.success("Note added");
  };

  return (
    <Drawer
      title={
        <div className="leading-tight">
          <div style={{ fontSize: 14, fontWeight: 600 }}>Notes</div>
          <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", fontWeight: 400 }}>
            {deal.code} · {deal.borrowerName}
          </div>
        </div>
      }
      placement="right"
      width={520}
      open={open}
      onClose={onClose}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ padding: 16, borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
        <Form layout="vertical" size="small">
          <Form.Item label="Category" style={{ marginBottom: 8 }}>
            <Select
              value={category}
              onChange={setCategory}
              options={categories.map((c) => ({ label: c, value: c }))}
            />
          </Form.Item>
          <Form.Item label="Note" style={{ marginBottom: 8 }}>
            <Input.TextArea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`What's the update on ${deal.borrowerName}?`}
            />
          </Form.Item>
          <div className="flex justify-between items-center">
            <Button type="text" size="small" icon={<PaperClipOutlined />}>
              Attach
            </Button>
            <Button type="primary" size="small" onClick={submit} disabled={!text.trim()}>
              Add Note
            </Button>
          </div>
        </Form>
      </div>

      <div style={{ padding: 16 }}>
        <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
          History · {notes.length}
        </Typography.Text>
        <div className="mt-2 space-y-3">
          {notes.length === 0 && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              No notes yet.
            </Typography.Text>
          )}
          {notes.map((n) => (
            <div
              key={n.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                padding: "10px 12px",
                background: "#fff",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <Space size={6}>
                  <Tag style={{ margin: 0 }}>{n.category}</Tag>
                  <Typography.Text style={{ fontSize: 12, fontWeight: 600 }}>
                    {n.author}
                  </Typography.Text>
                </Space>
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                  {n.timestamp}
                </Typography.Text>
              </div>
              <Typography.Paragraph style={{ margin: 0, fontSize: 13, lineHeight: 1.55 }}>
                {n.text}
              </Typography.Paragraph>
            </div>
          ))}
        </div>
      </div>
      <Divider style={{ margin: 0 }} />
    </Drawer>
  );
}
