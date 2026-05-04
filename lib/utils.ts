import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amountMM: number, opts?: { compact?: boolean }) {
  if (opts?.compact && amountMM >= 1000) {
    return `$${(amountMM / 1000).toFixed(2)}B`;
  }
  if (amountMM >= 1) {
    return `$${amountMM.toFixed(0)}MM`;
  }
  return `$${(amountMM * 1000).toFixed(0)}K`;
}

export function formatPercent(value: number, digits = 2) {
  return `${value.toFixed(digits)}%`;
}

export function formatMultiple(value: number) {
  return `${value.toFixed(2)}x`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
