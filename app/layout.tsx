import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { AppShell } from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CreditOS — Private Credit Underwriting",
  description: "Deal pipeline, diligence, and IC memo workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                colorPrimary: "#0f172a",
                borderRadius: 6,
                fontSize: 13,
              },
              components: {
                Layout: {
                  bodyBg: "#f8fafc",
                  headerBg: "#ffffff",
                  siderBg: "#ffffff",
                  headerHeight: 52,
                  headerPadding: "0 24px",
                },
                Menu: {
                  itemHeight: 34,
                  itemMarginInline: 8,
                  itemMarginBlock: 2,
                  itemBorderRadius: 6,
                  itemSelectedBg: "#0f172a",
                  itemSelectedColor: "#ffffff",
                  itemHoverBg: "#f1f5f9",
                  itemHoverColor: "#0f172a",
                  itemColor: "#334155",
                  iconSize: 14,
                  fontSize: 13,
                },
                Card: {
                  headerBg: "#ffffff",
                  headerHeight: 44,
                  headerHeightSM: 36,
                },
              },
            }}
          >
            <AppShell>{children}</AppShell>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
