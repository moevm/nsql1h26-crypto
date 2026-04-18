import type { WatchlistCoin } from "@/types/coins";
import type { StatisticsPreset } from "@/types/ui";

export type ViewStatus = "loading" | "ready" | "empty" | "error";

export interface WatchlistViewState {
  status: ViewStatus;
  coins: WatchlistCoin[];
  totalLabel: string;
  retry: () => void;
}

export interface FavoritesViewState {
  status: ViewStatus;
  coins: WatchlistCoin[];
  totalLabel: string;
  retry: () => void;
}

export interface StatisticsViewState {
  status: ViewStatus;
  chartBars: number[];
  chartLabels: string[];
  selectedSymbols: string[];
  presets: StatisticsPreset[];
  retry: () => void;
}

export interface ImportExportViewState {
  status: ViewStatus;
  exportDescription: string;
  importDescription: string;
  retry: () => void;
}
