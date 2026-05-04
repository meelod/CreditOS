"use client";
import { Button, message } from "antd";
import { EditOutlined } from "@ant-design/icons";

export function EditButton({ section }: { section: string }) {
  return (
    <Button
      size="small"
      type="text"
      icon={<EditOutlined />}
      onClick={() =>
        message.info(`Edit ${section} — opens an inline editor in production.`)
      }
      style={{ color: "#64748b" }}
    >
      Edit
    </Button>
  );
}
