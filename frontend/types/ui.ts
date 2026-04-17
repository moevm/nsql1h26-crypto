import type { AuthRole } from "@/types/auth";

export type AppSection = "coins" | "favorites" | "statistics" | "importExport";

export interface AppNavItem {
  key: AppSection;
  label: string;
  href: string;
  requiredRole?: AuthRole;
}

export interface WatchlistRow {
  symbol: string;
  name: string;
  price: string;
  change: string;
  cap: string;
  volume: string;
  favorite: boolean;
}

export interface FavoriteRow {
  symbol: string;
  name: string;
  price: string;
  change: string;
  cap: string;
  volume: string;
}

export interface StatisticsPreset {
  name: string;
  symbols: string;
  range: string;
  aggregation: string;
}

export type ToastType = "success" | "error" | "info";

export interface ToastInput {
  type: ToastType;
  message: string;
  title?: string;
}

export interface ToastItem extends ToastInput {
  id: string;
}
