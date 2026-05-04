"use client";
import { useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type GridReadyEvent,
  type ICellRendererParams,
  type ValueFormatterParams,
} from "ag-grid-community";
import { useRouter } from "next/navigation";
import { deals } from "@/lib/data";
import type { Deal } from "@/lib/types";

ModuleRegistry.registerModules([AllCommunityModule]);

const theme = themeQuartz.withParams({
  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  fontSize: 13,
  headerFontSize: 11,
  headerFontWeight: 600,
  headerTextColor: "#475569",
  headerBackgroundColor: "#f8fafc",
  borderColor: "#e2e8f0",
  rowBorder: { color: "#f1f5f9" },
  rowHoverColor: "#f8fafc",
  selectedRowBackgroundColor: "#eef2ff",
  oddRowBackgroundColor: "#ffffff",
  rowHeight: 44,
  headerHeight: 34,
  cellHorizontalPadding: 12,
  accentColor: "#0f172a",
});

const stageStyle = (stage: string) => {
  const map: Record<string, string> = {
    Sourcing: "bg-slate-100 text-slate-600",
    Screening: "bg-slate-100 text-slate-700",
    IOI: "bg-indigo-50 text-indigo-700",
    Diligence: "bg-indigo-100 text-indigo-800",
    "IC Review": "bg-amber-100 text-amber-800",
    Closed: "bg-emerald-100 text-emerald-800",
    Passed: "bg-rose-50 text-rose-700",
  };
  return map[stage] ?? "bg-slate-100 text-slate-700";
};

const fmtMM = (params: ValueFormatterParams) => {
  const v = params.value as number;
  if (v == null) return "";
  return `$${v.toLocaleString()}`;
};

const fmtPct = (digits: number) => (params: ValueFormatterParams) => {
  const v = params.value as number;
  if (v == null) return "";
  return `${v.toFixed(digits)}%`;
};

const fmtMultiple = (params: ValueFormatterParams) => {
  const v = params.value as number;
  if (v == null) return "";
  return `${v.toFixed(2)}x`;
};

const fmtSpread = (params: ValueFormatterParams) => {
  const v = params.value as number;
  if (v == null) return "";
  return `S+${v}`;
};

const fmtDate = (params: ValueFormatterParams) => {
  const v = params.value as string;
  if (!v || v === "—") return "—";
  return new Date(v).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
};

const StageRenderer = (params: ICellRendererParams) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${stageStyle(params.value)}`}
  >
    {params.value}
  </span>
);

const DealRenderer = (params: ICellRendererParams) => {
  const d = params.data as Deal;
  return (
    <div className="leading-tight py-0.5">
      <div className="font-medium text-slate-900">{d.borrowerName}</div>
      <div className="text-[11px] text-slate-500 font-mono">{d.code}</div>
    </div>
  );
};

type Filter = "All" | "Active" | "Closed" | "Passed";

export function PipelineGrid() {
  const router = useRouter();
  const gridRef = useRef<AgGridReact<Deal>>(null);
  const [filter, setFilter] = useState<Filter>("Active");
  const [quickFilter, setQuickFilter] = useState("");

  const rowData = useMemo(() => {
    if (filter === "All") return deals;
    if (filter === "Active")
      return deals.filter((d) => d.stage !== "Closed" && d.stage !== "Passed");
    return deals.filter((d) => d.stage === filter);
  }, [filter]);

  const columnDefs = useMemo<ColDef<Deal>[]>(
    () => [
      {
        field: "borrowerName",
        headerName: "Deal",
        pinned: "left",
        width: 220,
        cellRenderer: DealRenderer,
        filter: "agTextColumnFilter",
      },
      {
        field: "stage",
        headerName: "Stage",
        width: 110,
        cellRenderer: StageRenderer,
        filter: "agTextColumnFilter",
      },
      { field: "sector", headerName: "Sector", width: 130, filter: "agTextColumnFilter" },
      { field: "geography", headerName: "Geography", width: 150 },
      {
        colId: "sponsor",
        headerName: "Sponsor",
        valueGetter: (p) => p.data?.sponsor.name,
        width: 180,
      },
      { field: "useOfProceeds", headerName: "Use of Proceeds", width: 150 },
      {
        field: "totalDealSizeMM",
        headerName: "Deal Size",
        width: 100,
        type: "numericColumn",
        cellClass: "ag-right-aligned-cell",
        valueFormatter: fmtMM,
        filter: "agNumberColumnFilter",
      },
      {
        field: "ourCommitmentMM",
        headerName: "Our Hold",
        width: 100,
        type: "numericColumn",
        cellClass: "ag-right-aligned-cell font-semibold",
        valueFormatter: fmtMM,
        filter: "agNumberColumnFilter",
      },
      {
        field: "ltmRevenue",
        headerName: "LTM Rev.",
        width: 100,
        type: "numericColumn",
        cellClass: "ag-right-aligned-cell",
        valueFormatter: fmtMM,
        filter: "agNumberColumnFilter",
      },
      {
        field: "ltmEbitda",
        headerName: "LTM EBITDA",
        width: 110,
        type: "numericColumn",
        cellClass: "ag-right-aligned-cell",
        valueFormatter: fmtMM,
        filter: "agNumberColumnFilter",
      },
      {
        field: "totalLeverage",
        headerName: "Total Lev.",
        width: 100,
        type: "numericColumn",
        cellClass: "ag-right-aligned-cell",
        valueFormatter: fmtMultiple,
        filter: "agNumberColumnFilter",
      },
      {
        field: "seniorLeverage",
        headerName: "Sr. Lev.",
        width: 95,
        type: "numericColumn",
        cellClass: "ag-right-aligned-cell",
        valueFormatter: fmtMultiple,
      },
      {
        field: "ltv",
        headerName: "LTV",
        width: 75,
        type: "numericColumn",
        cellClass: "ag-right-aligned-cell",
        valueFormatter: (p) => (p.value ? `${p.value}%` : "—"),
      },
      {
        field: "fixedChargeCoverage",
        headerName: "FCC",
        width: 85,
        type: "numericColumn",
        cellClass: "ag-right-aligned-cell",
        valueFormatter: (p) =>
          p.value ? `${(p.value as number).toFixed(2)}x` : "—",
      },
      {
        field: "blendedYield",
        headerName: "Yield",
        width: 85,
        type: "numericColumn",
        cellClass: "ag-right-aligned-cell font-semibold",
        valueFormatter: fmtPct(2),
        filter: "agNumberColumnFilter",
      },
      {
        field: "blendedSpread",
        headerName: "Spread",
        width: 90,
        type: "numericColumn",
        cellClass: "ag-right-aligned-cell",
        valueFormatter: fmtSpread,
      },
      { field: "leadAnalyst", headerName: "Lead", width: 90 },
      {
        field: "expectedClose",
        headerName: "Exp. Close",
        width: 110,
        valueFormatter: fmtDate,
      },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressMovable: false,
      minWidth: 70,
    }),
    [],
  );

  const onGridReady = (_e: GridReadyEvent) => {
    // Columns use explicit widths sized to content; no auto-fit.
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50/40">
        <div className="flex items-center gap-1">
          {(["All", "Active", "IC Review", "Diligence", "Closed", "Passed"] as const).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f as Filter)}
                className={`text-xs px-2.5 py-1 rounded ${
                  filter === f
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                {f}
              </button>
            ),
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            placeholder="Quick filter…"
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
            className="h-7 w-56 rounded-md border border-slate-300 bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <button
            onClick={() => gridRef.current?.api.exportDataAsCsv()}
            className="text-xs px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
          >
            Export CSV
          </button>
          <button
            onClick={() => gridRef.current?.api.autoSizeAllColumns()}
            className="text-xs px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
          >
            Auto-fit
          </button>
        </div>
      </div>
      <div style={{ height: "calc(100vh - 180px)", width: "100%" }}>
        <AgGridReact<Deal>
          ref={gridRef}
          theme={theme}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilter}
          onGridReady={onGridReady}
          onRowClicked={(e) => e.data && router.push(`/deals/${e.data.id}`)}
          getRowId={(p) => p.data.id}
          suppressCellFocus
          animateRows={false}
        />
      </div>
    </div>
  );
}
