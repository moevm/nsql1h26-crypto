export type ToastType = "success" | "error" | "info";

export interface ToastInput {
  type: ToastType;
  message: string;
  title?: string;
}

export interface ToastItem extends ToastInput {
  id: string;
}

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
