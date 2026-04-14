export type AppSection = "coins" | "favorites" | "statistics" | "importExport";

export interface AppNavItem {
  key: AppSection;
  label: string;
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
