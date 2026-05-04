"use client";
import { useMemo } from "react";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
} from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const baseTheme = themeQuartz.withParams({
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
  rowHeight: 36,
  headerHeight: 32,
  cellHorizontalPadding: 12,
  accentColor: "#0f172a",
  wrapperBorder: false,
});

export type GridColDef<T> = ColDef<T>;

export function DataGrid<T>({
  rowData,
  columnDefs,
  height,
  domLayout = "autoHeight",
  onRowClicked,
  ...rest
}: {
  rowData: T[];
  columnDefs: ColDef<T>[];
  height?: number;
  domLayout?: "autoHeight" | "normal" | "print";
} & Omit<AgGridReactProps<T>, "rowData" | "columnDefs" | "theme" | "domLayout">) {
  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 70,
    }),
    [],
  );

  return (
    <div style={domLayout === "autoHeight" ? undefined : { height: height ?? 400, width: "100%" }}>
      <AgGridReact<T>
        theme={baseTheme}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        domLayout={domLayout}
        suppressCellFocus
        animateRows={false}
        onRowClicked={onRowClicked}
        {...rest}
      />
    </div>
  );
}
