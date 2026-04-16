import type {
  FavoritesToastMessages,
  ImportExportToastMessages,
  StatisticsToastMessages,
  WatchlistToastMessages
} from "@/types/toast";

export const watchlistToastMessages: WatchlistToastMessages = {
  addCoinPending: {
    type: "info",
    title: "Главная",
    message: "Затычка"
  },
  comparePending: {
    type: "info",
    title: "Главная",
    message: "Затычка"
  },
  filtersShown: {
    type: "info",
    title: "Фильтры",
    message: "Затычка"
  },
  filtersApplied: {
    type: "success",
    title: "Фильтр",
    message: "Затычка"
  },
  filtersReset: {
    type: "info",
    title: "Фильтр",
    message: "Затычка"
  }
};

export const favoritesToastMessages: FavoritesToastMessages = {
  filtersApplied: {
    type: "success",
    title: "Избранное",
    message: "Затычка"
  },
  filtersReset: {
    type: "info",
    title: "Избранное",
    message: "Затычка"
  }
};

export const statisticsToastMessages: StatisticsToastMessages = {
  chartBuilt: {
    type: "success",
    title: "Статистика",
    message: "Затычка"
  },
  presetSaved: {
    type: "success",
    title: "Статистика",
    message: "Затычка"
  },
  formReset: {
    type: "info",
    title: "Статистика",
    message: "Затычка"
  },
  presetLoaded: (presetName) => ({
    type: "info",
    title: "Набор",
    message: "Затычка"
  }),
  presetRemoved: (presetName) => ({
    type: "info",
    title: "Набор",
    message: "Затычка"
  })
};

export const importExportToastMessages: ImportExportToastMessages = {
  exportStarted: {
    type: "success",
    title: "Экспорт",
    message: "Затычка"
  },
  fileSelectPending: {
    type: "info",
    title: "Импорт",
    message: "Затычка"
  },
  importStarted: {
    type: "success",
    title: "Импорт",
    message: "Затычка"
  },
  importReset: {
    type: "info",
    title: "Импорт",
    message: "Затычка"
  }
};
