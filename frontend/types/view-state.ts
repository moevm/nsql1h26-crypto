import type { FavoriteRow, StatisticsPreset, WatchlistRow } from "@/types/ui";

export type ViewStatus = "ready" | "error";

export interface WatchlistViewState {
  status: ViewStatus;
  rows: WatchlistRow[];
  totalLabel: string;
  retry: () => void;
}

export interface FavoritesViewState {
  status: ViewStatus;
  rows: FavoriteRow[];
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
