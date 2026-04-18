import type { AuthRole } from "@/types/auth";
import type { WatchlistCoin } from "@/types/coins";

export type AppSection = "coins" | "favorites" | "statistics" | "importExport";

export interface AppNavItem {
  key: AppSection;
  label: string;
  href: string;
  requiredRole?: AuthRole;
}

export type CoinTableActionTone = "secondary" | "ghost" | "danger";

export interface CoinTableAction {
  key: string;
  label: string;
  tone?: CoinTableActionTone;
  onClick: (coin: WatchlistCoin) => void;
  getAriaLabel?: (coin: WatchlistCoin) => string;
  isDisabled?: (coin: WatchlistCoin) => boolean;
  isPending?: (coin: WatchlistCoin) => boolean;
  pendingLabel?: string;
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
