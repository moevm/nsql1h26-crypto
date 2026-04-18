import { useEffect, useState } from "react";

import { coinsService } from "@/services/coins";
import { ApiError } from "@/services/http-client";
import type {
  CoinTableSortDirection,
  CoinTableSortKey,
  CoinTableSortState,
  WatchlistCoin
} from "@/types/coins";
import type { ViewStatus } from "@/types/view-state";

interface FilterRangeValue {
  start: string;
  end: string;
}

interface WatchlistEmptyState {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface UseWatchlistViewResult {
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

const createEmptyRange = (): FilterRangeValue => ({
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

const getRangeValidationMessage = (
  label: string,
  range: FilterRangeValue
): string | null => {
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

const getCoinsErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Не удалось загрузить список монет";
};

export const useWatchlistView = (): UseWatchlistViewResult => {
  const [sourceCoins, setSourceCoins] = useState<WatchlistCoin[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<ViewStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("Не удалось загрузить список монет");
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [priceRange, setPriceRange] = useState<FilterRangeValue>(createEmptyRange);
  const [capRange, setCapRange] = useState<FilterRangeValue>(createEmptyRange);
  const [changeRange, setChangeRange] = useState<FilterRangeValue>(createEmptyRange);
  const [volumeRange, setVolumeRange] = useState<FilterRangeValue>(createEmptyRange);
  const [sort, setSort] = useState<CoinTableSortState | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadWatchlist = async () => {
      setStatus("loading");
      setErrorMessage("Не удалось загрузить список монет");

      try {
        const response = await coinsService.getWatchlist();

        if (isCancelled) {
          return;
        }

        setSourceCoins(response.coins);
        setTotalCount(response.totalCount);
        setStatus(response.coins.length === 0 || response.totalCount === 0 ? "empty" : "ready");
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setSourceCoins([]);
        setTotalCount(0);
        setErrorMessage(getCoinsErrorMessage(error));
        setStatus("error");
      }
    };

    void loadWatchlist();

    return () => {
      isCancelled = true;
    };
  }, [reloadKey]);

  const sourceOrder = new Map(sourceCoins.map((coin, index) => [coin.symbol, index]));
  const rangeValidationMessage =
    getRangeValidationMessage("Цена", priceRange) ??
    getRangeValidationMessage("Капитализация", capRange) ??
    getRangeValidationMessage("Изменение за 24ч", changeRange) ??
    getRangeValidationMessage("Объем торгов", volumeRange);
  const filteredCoins = sourceCoins.filter((coin) => {
    return (
      matchesTextFilter(coin, query) &&
      matchesNumberRange(coin.priceUsd, priceRange) &&
      matchesNumberRange(coin.marketCapUsd, capRange) &&
      matchesNumberRange(coin.change24hPercent, changeRange) &&
      matchesNumberRange(coin.volume24hUsd, volumeRange)
    );
  });
  const visibleCoins = sort
    ? [...filteredCoins].sort((leftCoin, rightCoin) =>
        compareCoins(leftCoin, rightCoin, sort, sourceOrder)
      )
    : filteredCoins;
  const hasActiveFilters =
    normalizeText(query).length > 0 ||
    hasRangeValue(priceRange) ||
    hasRangeValue(capRange) ||
    hasRangeValue(changeRange) ||
    hasRangeValue(volumeRange) ||
    sort !== null;

  const resetFilters = () => {
    setQuery("");
    setPriceRange(createEmptyRange());
    setCapRange(createEmptyRange());
    setChangeRange(createEmptyRange());
    setVolumeRange(createEmptyRange());
    setSort(null);
  };

  const requestSort = (key: CoinTableSortKey) => {
    setSort((currentSort) => {
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
    });
  };

  let derivedStatus: ViewStatus = status;

  if (status === "ready" || status === "empty") {
    if (sourceCoins.length === 0 || totalCount === 0) {
      derivedStatus = "empty";
    } else if (rangeValidationMessage || visibleCoins.length === 0) {
      derivedStatus = "empty";
    } else {
      derivedStatus = "ready";
    }
  }

  let emptyState: WatchlistEmptyState = {
    title: "Watchlist пока пуст",
    message: "Добавьте монеты"
  };

  if (sourceCoins.length > 0 || totalCount > 0) {
    if (rangeValidationMessage) {
      emptyState = {
        title: "Проверьте диапазоны",
        message: rangeValidationMessage,
        actionLabel: "Сбросить фильтры",
        onAction: resetFilters
      };
    } else {
      emptyState = {
        title: "Монеты не найдены",
        message: "Измените фильтры или сбросьте их",
        actionLabel: "Сбросить фильтры",
        onAction: resetFilters
      };
    }
  }

  return {
    status: derivedStatus,
    coins: visibleCoins,
    totalLabel: `Показано ${visibleCoins.length} из ${totalCount}`,
    errorMessage,
    emptyState,
    query,
    setQuery,
    priceRange,
    setPriceStart: (value: string) =>
      setPriceRange((currentRange) => ({
        ...currentRange,
        start: value
      })),
    setPriceEnd: (value: string) =>
      setPriceRange((currentRange) => ({
        ...currentRange,
        end: value
      })),
    capRange,
    setCapStart: (value: string) =>
      setCapRange((currentRange) => ({
        ...currentRange,
        start: value
      })),
    setCapEnd: (value: string) =>
      setCapRange((currentRange) => ({
        ...currentRange,
        end: value
      })),
    changeRange,
    setChangeStart: (value: string) =>
      setChangeRange((currentRange) => ({
        ...currentRange,
        start: value
      })),
    setChangeEnd: (value: string) =>
      setChangeRange((currentRange) => ({
        ...currentRange,
        end: value
      })),
    volumeRange,
    setVolumeStart: (value: string) =>
      setVolumeRange((currentRange) => ({
        ...currentRange,
        start: value
      })),
    setVolumeEnd: (value: string) =>
      setVolumeRange((currentRange) => ({
        ...currentRange,
        end: value
      })),
    hasActiveFilters,
    resetFilters,
    sort,
    requestSort,
    retry: () => setReloadKey((currentKey) => currentKey + 1)
  };
};
