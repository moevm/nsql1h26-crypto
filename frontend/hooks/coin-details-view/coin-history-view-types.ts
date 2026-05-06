import type { CoinHistoryEntry } from "@/types/coins";
import type { CoinTablePagination } from "@/types/coin-table";
import type { ViewStatus } from "@/types/status";

export interface CoinHistoryFiltersDraft {
  dateFrom: string;
  dateTo: string;
  priceMin: string;
  priceMax: string;
  volumeMin: string;
  volumeMax: string;
}

export interface CoinHistoryFiltersViewState {
  draft: CoinHistoryFiltersDraft;
  validationMessage: string | null;
  isApplyDisabled: boolean;
  isApplyPending: boolean;
  isResetDisabled: boolean;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onPriceMinChange: (value: string) => void;
  onPriceMaxChange: (value: string) => void;
  onVolumeMinChange: (value: string) => void;
  onVolumeMaxChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export interface CoinHistoryChartFilters {
  priceMin: number | null;
  priceMax: number | null;
  volumeMin: number | null;
  volumeMax: number | null;
}

export interface UseCoinHistoryViewResult {
  entries: CoinHistoryEntry[];
  chartEntries: CoinHistoryEntry[];
  chartFilters: CoinHistoryChartFilters;
  errorMessage: string;
  filters: CoinHistoryFiltersViewState;
  pagination: CoinTablePagination;
  retry: () => Promise<void>;
  status: ViewStatus;
  totalLabel: string;
}
