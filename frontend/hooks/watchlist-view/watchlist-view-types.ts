import type {
  SearchableCoinListTemplateFiltersProps,
  SearchableCoinListTemplateTableProps
} from "@/components/coins/searchable-coin-list-template";

export interface UseWatchlistViewResult {
  filters: SearchableCoinListTemplateFiltersProps;
  table: SearchableCoinListTemplateTableProps;
  isRefreshPending: boolean;
  refreshWatchlist: () => Promise<void>;
  reloadWatchlist: (options?: {
    showLoading?: boolean;
    preserveDataOnError?: boolean;
  }) => Promise<void>;
}
