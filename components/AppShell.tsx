"use client";
import { Layout, Menu, Input, Avatar, Typography } from "antd";
import {
  AppstoreOutlined,
  FundOutlined,
  LineChartOutlined,
  SearchOutlined,
  BellOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { Sider, Header, Content } = Layout;

const items = [
  { key: "/", icon: <AppstoreOutlined />, label: <Link href="/">Pipeline</Link> },
  {
    key: "/portfolio",
    icon: <FundOutlined />,
    label: <Link href="/portfolio">Portfolio</Link>,
  },
  {
    key: "/markets",
    icon: <LineChartOutlined />,
    label: <Link href="/markets">Market Comps</Link>,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const selected = items
    .map((i) => i.key)
    .filter((k) => (k === "/" ? pathname === "/" : pathname.startsWith(k)));

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider
        width={224}
        style={{ borderRight: "1px solid #e2e8f0", background: "#fff" }}
      >
        <div className="px-4 pt-4 pb-3 border-b border-slate-200 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-slate-900 text-white text-xs font-semibold">
            CO
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">CreditOS</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              Westview Direct Lending
            </div>
          </div>
        </div>
        <div className="px-3 pt-3">
          <Input
            size="small"
            placeholder="Search deals…"
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
          />
        </div>
        <Menu
          mode="inline"
          selectedKeys={selected}
          items={items}
          style={{ borderInlineEnd: 0, marginTop: 8 }}
        />
        <div className="absolute bottom-3 left-3 right-3 border-t border-slate-200 pt-3">
          <div className="flex items-center gap-2 px-2">
            <Avatar
              size="small"
              style={{
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                fontSize: 11,
              }}
            >
              SP
            </Avatar>
            <div className="leading-tight flex-1">
              <div className="text-xs font-medium text-slate-900">
                Sarah Park
              </div>
              <div className="text-[11px] text-slate-500">Principal</div>
            </div>
          </div>
        </div>
      </Sider>
      <Layout>
        <Header
          style={{
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <Typography.Text strong style={{ fontSize: 14 }}>
            Westview Direct Lending — Fund IV · Q2 2026
          </Typography.Text>
          <div className="flex items-center gap-3">
            <BellOutlined style={{ color: "#64748b" }} />
            <Avatar size="small" style={{ background: "#0f172a", fontSize: 11 }}>
              SP
            </Avatar>
          </div>
        </Header>
        <Content style={{ overflow: "auto" }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
