import { createEmptyRange } from "@/hooks/watchlist-view/watchlist-view-helpers";
import type {
  CoinFilterRangesState,
  CoinTableSortState,
  FavoritesRequestParams,
  WatchlistCoin
} from "@/types/coins";
import type { FavoritesEmptyState } from "@/hooks/favorites-view/favorites-view-types";

export const FAVORITES_PAGE_SIZE = 10;
export const FAVORITES_QUERY_FETCH_PAGE_SIZE = 1000;
export const FAVORITES_FILTER_DEBOUNCE_MS = 400;

export const createEmptyFavoritesRanges = (): CoinFilterRangesState => ({
  price: createEmptyRange(),
  cap: createEmptyRange(),
  change: createEmptyRange(),
  volume: createEmptyRange()
});

const parseRangeNumber = (value: string): number | undefined => {
  const normalizedValue = value.trim().replace(",", ".");

  if (!normalizedValue) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

export const normalizeFavoritesQuery = (value: string): string =>
  value.trim().toLocaleLowerCase();

export const matchesFavoritesTextQuery = (coin: WatchlistCoin, query: string): boolean => {
  if (!query) {
    return true;
  }

  return (
    normalizeFavoritesQuery(coin.name).includes(query) ||
    normalizeFavoritesQuery(coin.symbol).includes(query)
  );
};

export const getFavoritesRequestParams = (options: {
  pageNo: number;
  sort: CoinTableSortState | null;
  query: string;
  ranges: CoinFilterRangesState;
}): FavoritesRequestParams => {
  const hasTextQuery = options.query.length > 0;

  return {
    pageNo: hasTextQuery ? 0 : options.pageNo,
    pageSize: hasTextQuery ? FAVORITES_QUERY_FETCH_PAGE_SIZE : FAVORITES_PAGE_SIZE,
    sortBy: options.sort?.key,
    order: options.sort?.direction,
    priceMin: parseRangeNumber(options.ranges.price.start),
    priceMax: parseRangeNumber(options.ranges.price.end),
    capMin: parseRangeNumber(options.ranges.cap.start),
    capMax: parseRangeNumber(options.ranges.cap.end),
    changeMin: parseRangeNumber(options.ranges.change.start),
    changeMax: parseRangeNumber(options.ranges.change.end),
    volumeMin: parseRangeNumber(options.ranges.volume.start),
    volumeMax: parseRangeNumber(options.ranges.volume.end)
  };
};

export const paginateFavoritesCoins = (
  coins: WatchlistCoin[],
  pageNo: number,
  pageSize: number
): WatchlistCoin[] => {
  const start = pageNo * pageSize;

  return coins.slice(start, start + pageSize);
};

export const getFavoritesTotalLabel = (
  visibleCount: number,
  totalCount: number,
  pageNo: number
): string => {
  if (totalCount === 0 || visibleCount === 0) {
    return "Показано 0 из 0";
  }

  const start = pageNo * FAVORITES_PAGE_SIZE + 1;
  const end = start + visibleCount - 1;

  return `Показано ${start}-${end} из ${totalCount}`;
};

export const getFavoritesEmptyState = (options: {
  totalCount: number;
  hasActiveFilters: boolean;
  rangeValidationMessage: string | null;
  resetFilters: () => void;
}): FavoritesEmptyState => {
  if (options.rangeValidationMessage) {
    return {
      title: "Проверьте диапазоны",
      message: options.rangeValidationMessage,
      actionLabel: "Сбросить фильтры",
      onAction: options.resetFilters
    };
  }

  if (options.totalCount === 0 && !options.hasActiveFilters) {
    return {
      title: "Избранное пока пусто",
      message: "Добавьте монеты в избранное на странице watchlist"
    };
  }

  return {
    title: "Монеты не найдены",
    message: "Измените фильтры или сбросьте их",
    actionLabel: "Сбросить фильтры",
    onAction: options.resetFilters
  };
};
