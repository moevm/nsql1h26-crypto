import { ApiError } from "@/services/http-client";
import type {
  CoinTableSortDirection,
  CoinTableSortKey,
  CoinTableSortState,
  WatchlistCoin
} from "@/types/coins";
import { VIEW_STATUS, type ViewStatus } from "@/types/status";

import type {
  FilterRangeValue,
  FilterRangesState,
  WatchlistEmptyState
} from "@/hooks/watchlist-view/watchlist-view-types";

interface WatchlistFilterState {
  query: string;
  ranges: FilterRangesState;
  sort: CoinTableSortState | null;
}

interface DerivedStatusOptions {
  status: ViewStatus;
  sourceCount: number;
  totalCount: number;
  visibleCount: number;
  rangeValidationMessage: string | null;
}

interface EmptyStateOptions {
  sourceCount: number;
  totalCount: number;
  rangeValidationMessage: string | null;
  resetFilters: () => void;
}

export const createEmptyRange = (): FilterRangeValue => ({
  start: "",
  end: ""
});

const normalizeText = (value: string): string => value.trim().toLocaleLowerCase();

const parseRangeNumber = (value: string): number | null => {
  const normalizedValue = value.trim().replace(",", ".");

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const hasRangeValue = (range: FilterRangeValue): boolean =>
  range.start.trim().length > 0 || range.end.trim().length > 0;

const getRangeValidationMessage = (label: string, range: FilterRangeValue): string | null => {
  const startValue = parseRangeNumber(range.start);
  const endValue = parseRangeNumber(range.end);

  if (startValue !== null && endValue !== null && startValue > endValue) {
    return `Поле «${label}»: значение «от» не должно быть больше значения «до»`;
  }

  return null;
};

const matchesTextFilter = (coin: WatchlistCoin, query: string): boolean => {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return true;
  }

  return (
    normalizeText(coin.name).includes(normalizedQuery) ||
    normalizeText(coin.symbol).includes(normalizedQuery)
  );
};

const matchesNumberRange = (value: number | null, range: FilterRangeValue): boolean => {
  const startValue = parseRangeNumber(range.start);
  const endValue = parseRangeNumber(range.end);

  if (startValue === null && endValue === null) {
    return true;
  }

  if (value === null) {
    return false;
  }

  if (startValue !== null && value < startValue) {
    return false;
  }

  if (endValue !== null && value > endValue) {
    return false;
  }

  return true;
};

const compareTextValues = (
  leftValue: string,
  rightValue: string,
  direction: CoinTableSortDirection
): number => {
  const comparisonResult = leftValue.localeCompare(rightValue, "ru", {
    sensitivity: "base"
  });

  return direction === "asc" ? comparisonResult : comparisonResult * -1;
};

const compareNullableNumbers = (
  leftValue: number | null,
  rightValue: number | null,
  direction: CoinTableSortDirection
): number => {
  if (leftValue === null && rightValue === null) {
    return 0;
  }

  if (leftValue === null) {
    return 1;
  }

  if (rightValue === null) {
    return -1;
  }

  return direction === "asc" ? leftValue - rightValue : rightValue - leftValue;
};

const compareCoins = (
  leftCoin: WatchlistCoin,
  rightCoin: WatchlistCoin,
  sort: CoinTableSortState,
  sourceOrder: Map<string, number>
): number => {
  let comparisonResult = 0;

  if (sort.key === "name") {
    comparisonResult = compareTextValues(leftCoin.name, rightCoin.name, sort.direction);

    if (comparisonResult === 0) {
      comparisonResult = compareTextValues(leftCoin.symbol, rightCoin.symbol, sort.direction);
    }
  }

  if (sort.key === "priceUsd") {
    comparisonResult = compareNullableNumbers(
      leftCoin.priceUsd,
      rightCoin.priceUsd,
      sort.direction
    );
  }

  if (sort.key === "change24hPercent") {
    comparisonResult = compareNullableNumbers(
      leftCoin.change24hPercent,
      rightCoin.change24hPercent,
      sort.direction
    );
  }

  if (sort.key === "marketCapUsd") {
    comparisonResult = compareNullableNumbers(
      leftCoin.marketCapUsd,
      rightCoin.marketCapUsd,
      sort.direction
    );
  }

  if (sort.key === "volume24hUsd") {
    comparisonResult = compareNullableNumbers(
      leftCoin.volume24hUsd,
      rightCoin.volume24hUsd,
      sort.direction
    );
  }

  if (comparisonResult !== 0) {
    return comparisonResult;
  }

  return (sourceOrder.get(leftCoin.symbol) ?? 0) - (sourceOrder.get(rightCoin.symbol) ?? 0);
};

export const getCoinsErrorMessage = (
  error: unknown,
  fallbackMessage = "Не удалось загрузить список монет"
): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

export const getWatchlistRangeValidationMessage = ({
  price,
  cap,
  change,
  volume
}: FilterRangesState): string | null => {
  return (
    getRangeValidationMessage("Цена", price) ??
    getRangeValidationMessage("Капитализация", cap) ??
    getRangeValidationMessage("Изменение за 24ч", change) ??
    getRangeValidationMessage("Объем торгов", volume)
  );
};

export const getVisibleCoins = (
  sourceCoins: WatchlistCoin[],
  filters: WatchlistFilterState
): WatchlistCoin[] => {
  const filteredCoins = sourceCoins.filter((coin) => {
    return (
      matchesTextFilter(coin, filters.query) &&
      matchesNumberRange(coin.priceUsd, filters.ranges.price) &&
      matchesNumberRange(coin.marketCapUsd, filters.ranges.cap) &&
      matchesNumberRange(coin.change24hPercent, filters.ranges.change) &&
      matchesNumberRange(coin.volume24hUsd, filters.ranges.volume)
    );
  });

  if (!filters.sort) {
    return filteredCoins;
  }

  const activeSort = filters.sort;
  const sourceOrder = new Map(sourceCoins.map((coin, index) => [coin.symbol, index]));

  return [...filteredCoins].sort((leftCoin, rightCoin) =>
    compareCoins(leftCoin, rightCoin, activeSort, sourceOrder)
  );
};

export const hasActiveWatchlistFilters = (filters: WatchlistFilterState): boolean => {
  return (
    normalizeText(filters.query).length > 0 ||
    hasRangeValue(filters.ranges.price) ||
    hasRangeValue(filters.ranges.cap) ||
    hasRangeValue(filters.ranges.change) ||
    hasRangeValue(filters.ranges.volume) ||
    filters.sort !== null
  );
};

export const getNextSortState = (
  currentSort: CoinTableSortState | null,
  key: CoinTableSortKey
): CoinTableSortState | null => {
  if (!currentSort || currentSort.key !== key) {
    return {
      key,
      direction: "asc"
    };
  }

  if (currentSort.direction === "asc") {
    return {
      key,
      direction: "desc"
    };
  }

  return null;
};

export const getDerivedWatchlistStatus = ({
  status,
  sourceCount,
  totalCount,
  visibleCount,
  rangeValidationMessage
}: DerivedStatusOptions): ViewStatus => {
  if (status !== VIEW_STATUS.READY && status !== VIEW_STATUS.EMPTY) {
    return status;
  }

  if (sourceCount === 0 || totalCount === 0) {
    return VIEW_STATUS.EMPTY;
  }

  if (rangeValidationMessage || visibleCount === 0) {
    return VIEW_STATUS.EMPTY;
  }

  return VIEW_STATUS.READY;
};

export const getWatchlistEmptyState = ({
  sourceCount,
  totalCount,
  rangeValidationMessage,
  resetFilters
}: EmptyStateOptions): WatchlistEmptyState => {
  if (sourceCount === 0 && totalCount === 0) {
    return {
      title: "Watchlist пока пуст",
      message: "Добавьте монеты",
      actionLabel: "Добавить монету"
    };
  }

  if (rangeValidationMessage) {
    return {
      title: "Проверьте диапазоны",
      message: rangeValidationMessage,
      actionLabel: "Сбросить фильтры",
      onAction: resetFilters
    };
  }

  return {
    title: "Монеты не найдены",
    message: "Измените фильтры или сбросьте их",
    actionLabel: "Сбросить фильтры",
    onAction: resetFilters
  };
};
