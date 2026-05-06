import type { CompareResponse, WatchlistCoin } from "@/types/coins";

export type CompareViewStatus = "idle" | "loading" | "ready" | "error";
export type CompareDatePreset = "7d" | "30d" | "90d";

export interface UseCompareViewResult {
  symbol1: string;
  extraSymbols: string[];
  searchQuery: string;
  searchResults: WatchlistCoin[];
  isSearching: boolean;
  datePreset: CompareDatePreset | null;
  dateFrom: string;
  dateTo: string;
  status: CompareViewStatus;
  compareData: CompareResponse | null;
  errorMessage: string;
  canCompare: boolean;
  headTitle: string;
  pageTitle: string;
  onSearchQueryChange: (query: string) => void;
  onAddSymbol: (symbol: string) => void;
  onRemoveSymbol: (symbol: string) => void;
  onDatePresetChange: (preset: CompareDatePreset) => void;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onCompare: () => Promise<void>;
  goBack: () => void;
}
