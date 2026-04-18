import type { CoinTableSortKey, CoinTableSortState, WatchlistCoin } from "@/types/coins";
import type { ViewStatus } from "@/types/view-state";

export interface FilterRangeValue {
  start: string;
  end: string;
}

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
  priceRange: FilterRangeValue;
  setPriceStart: (value: string) => void;
  setPriceEnd: (value: string) => void;
  capRange: FilterRangeValue;
  setCapStart: (value: string) => void;
  setCapEnd: (value: string) => void;
  changeRange: FilterRangeValue;
  setChangeStart: (value: string) => void;
  setChangeEnd: (value: string) => void;
  volumeRange: FilterRangeValue;
  setVolumeStart: (value: string) => void;
  setVolumeEnd: (value: string) => void;
  hasActiveFilters: boolean;
  resetFilters: () => void;
  sort: CoinTableSortState | null;
  requestSort: (key: CoinTableSortKey) => void;
  retry: () => void;
}
