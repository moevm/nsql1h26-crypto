import type {
  CoinFilterRangeEdge,
  CoinFilterRangeKey,
  CoinFilterRangesState,
  CoinTableSortKey,
  CoinTableSortState,
  WatchlistCoin
} from "@/types/coins";
import type { CoinTablePagination } from "@/types/coin-table";
import type { ViewStatus } from "@/types/status";

export interface FavoritesEmptyState {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface UseFavoritesViewResult {
  status: ViewStatus;
  coins: WatchlistCoin[];
  totalLabel: string;
  errorMessage: string;
  emptyState: FavoritesEmptyState;
  query: string;
  setQuery: (value: string) => void;
  ranges: CoinFilterRangesState;
  setRangeValue: (key: CoinFilterRangeKey, edge: CoinFilterRangeEdge, value: string) => void;
  hasActiveFilters: boolean;
  resetFilters: () => void;
  sort: CoinTableSortState | null;
  requestSort: (key: CoinTableSortKey) => void;
  pagination: CoinTablePagination;
  isPaginationPending: boolean;
  retry: () => void;
}
