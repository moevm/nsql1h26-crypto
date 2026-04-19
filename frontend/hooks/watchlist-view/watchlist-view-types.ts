import type { CoinTableAction } from "@/types/coin-table";
import type { CoinTableSortKey, CoinTableSortState, WatchlistCoin } from "@/types/coins";
import type { ViewStatus } from "@/types/status";

export interface FilterRangeValue {
  start: string;
  end: string;
}

export type FilterRangeKey = "price" | "cap" | "change" | "volume";
export type FilterRangeEdge = keyof FilterRangeValue;

export type FilterRangesState = Record<FilterRangeKey, FilterRangeValue>;

export interface WatchlistEmptyState {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface UseWatchlistViewResult {
  status: ViewStatus;
  coins: WatchlistCoin[];
  totalLabel: string;
  errorMessage: string;
  emptyState: WatchlistEmptyState;
  query: string;
  setQuery: (value: string) => void;
  ranges: FilterRangesState;
  setRangeValue: (key: FilterRangeKey, edge: FilterRangeEdge, value: string) => void;
  hasActiveFilters: boolean;
  resetFilters: () => void;
  sort: CoinTableSortState | null;
  requestSort: (key: CoinTableSortKey) => void;
  isRefreshPending: boolean;
  refreshWatchlist: () => Promise<void>;
  reloadWatchlist: (options?: { showLoading?: boolean }) => Promise<void>;
  onToggleFavorite: (coin: WatchlistCoin) => Promise<void>;
  getFavoriteActionLabel: (coin: WatchlistCoin) => string;
  isFavoriteActionPending: (coin: WatchlistCoin) => boolean;
  actions: CoinTableAction[];
  retry: () => void;
}
