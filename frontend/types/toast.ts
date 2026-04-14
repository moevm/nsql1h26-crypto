import type { ToastInput } from "@/types/ui";

export interface WatchlistToastMessages {
  addCoinPending: ToastInput;
  comparePending: ToastInput;
  filtersShown: ToastInput;
  filtersApplied: ToastInput;
  filtersReset: ToastInput;
}

export interface FavoritesToastMessages {
  filtersApplied: ToastInput;
  filtersReset: ToastInput;
}

export interface StatisticsToastMessages {
  chartBuilt: ToastInput;
  presetSaved: ToastInput;
  formReset: ToastInput;
  presetLoaded: (presetName: string) => ToastInput;
  presetRemoved: (presetName: string) => ToastInput;
}

export interface ImportExportToastMessages {
  exportStarted: ToastInput;
  fileSelectPending: ToastInput;
  importStarted: ToastInput;
  importReset: ToastInput;
}
