import type {
  CoinHistoryEntry,
  CoinHistoryRequestParams,
  CoinHistorySortKey,
  CoinCollectionRequestParams,
  CoinHistoryNumericFilterParams,
  CoinNumericFilterParams,
  CoinTableSortDirection,
  FavoritesRequestParams,
  SearchCoinsAppliedFilters,
  SearchCoinsRequestParams,
  WatchlistCoin
} from "@/types/coins";
import { getBackendCoinSortKey, getServerCoinTableSortKey } from "@/utils/coin-table-sorting";

type QueryParams = Record<string, string | number | boolean | undefined>;
type BackendCoinHistorySortKey = "timestamp" | "price" | "volume24h";

interface PaginationOptions {
  pageSize?: number;
  pageNo?: number;
  defaultPageSize: number;
}

const normalizeText = (value: string): string => value.trim().toLocaleLowerCase();

export const normalizeCoinSearchQuery = (value?: string): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
};

const buildCoinCollectionQueryParams = (
  params?: CoinCollectionRequestParams
): QueryParams | undefined => {
  if (!params) {
    return undefined;
  }

  return {
    pageNo: params.pageNo,
    pageSize: params.pageSize,
    sortBy: getBackendCoinSortKey(params.sortBy),
    order: params.order,
    priceMin: params.priceMin,
    priceMax: params.priceMax,
    capMin: params.capMin,
    capMax: params.capMax,
    changeMin: params.changeMin,
    changeMax: params.changeMax,
    volumeMin: params.volumeMin,
    volumeMax: params.volumeMax
  };
};

export const buildFavoritesQueryParams = (
  params?: FavoritesRequestParams
): QueryParams | undefined => buildCoinCollectionQueryParams(params);

export const buildSearchCoinsQueryParams = (
  params?: SearchCoinsRequestParams
): QueryParams | undefined => {
  const collectionParams = buildCoinCollectionQueryParams(params);
  const query = normalizeCoinSearchQuery(params?.query);

  if (!collectionParams && query === undefined) {
    return undefined;
  }

  return {
    ...collectionParams,
    query
  };
};

const BACKEND_COIN_HISTORY_SORT_KEY_BY_TABLE_KEY: Record<
  CoinHistorySortKey,
  BackendCoinHistorySortKey
> = {
  timestamp: "timestamp",
  priceUsd: "price",
  volume24hUsd: "volume24h"
};

const normalizeIsoDateParam = (value?: string): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return undefined;
  }

  return Number.isNaN(Date.parse(normalizedValue)) ? undefined : normalizedValue;
};

const getBackendCoinHistorySortKey = (
  sortKey?: CoinHistorySortKey
): BackendCoinHistorySortKey | undefined => {
  if (!sortKey) {
    return undefined;
  }

  return BACKEND_COIN_HISTORY_SORT_KEY_BY_TABLE_KEY[sortKey];
};

export const buildCoinHistoryQueryParams = (
  params?: CoinHistoryRequestParams
): QueryParams | undefined => {
  if (!params) {
    return undefined;
  }

  return {
    dateFrom: normalizeIsoDateParam(params.dateFrom),
    dateTo: normalizeIsoDateParam(params.dateTo),
    priceMin: params.priceMin,
    priceMax: params.priceMax,
    volumeMin: params.volumeMin,
    volumeMax: params.volumeMax,
    sortBy: getBackendCoinHistorySortKey(params.sortBy),
    order: params.order,
    pageNo: params.pageNo,
    pageSize: params.pageSize
  };
};

const matchesRange = (
  value: number | null,
  minValue?: number,
  maxValue?: number
): boolean => {
  if (minValue === undefined && maxValue === undefined) {
    return true;
  }

  if (value === null) {
    return false;
  }

  if (minValue !== undefined && value < minValue) {
    return false;
  }

  if (maxValue !== undefined && value > maxValue) {
    return false;
  }

  return true;
};

export const matchesCoinNumericFilters = (
  coin: WatchlistCoin,
  params?: CoinNumericFilterParams
): boolean => {
  if (!params) {
    return true;
  }

  return (
    matchesRange(coin.priceUsd, params.priceMin, params.priceMax) &&
    matchesRange(coin.marketCapUsd, params.capMin, params.capMax) &&
    matchesRange(coin.change24hPercent, params.changeMin, params.changeMax) &&
    matchesRange(coin.volume24hUsd, params.volumeMin, params.volumeMax)
  );
};

const matchesTimestampRange = (
  value: string,
  dateFrom?: string,
  dateTo?: string
): boolean => {
  if (!dateFrom && !dateTo) {
    return true;
  }

  const numericValue = Date.parse(value);

  if (Number.isNaN(numericValue)) {
    return false;
  }

  if (dateFrom && numericValue < Date.parse(dateFrom)) {
    return false;
  }

  if (dateTo && numericValue > Date.parse(dateTo)) {
    return false;
  }

  return true;
};

export const matchesCoinHistoryFilters = (
  entry: CoinHistoryEntry,
  params?: Pick<CoinHistoryRequestParams, "dateFrom" | "dateTo"> & CoinHistoryNumericFilterParams
): boolean => {
  if (!params) {
    return true;
  }

  return (
    matchesTimestampRange(entry.timestamp, params.dateFrom, params.dateTo) &&
    matchesRange(entry.priceUsd, params.priceMin, params.priceMax) &&
    matchesRange(entry.volume24hUsd, params.volumeMin, params.volumeMax)
  );
};

export const matchesCoinSearchQuery = (coin: WatchlistCoin, query?: string): boolean => {
  const normalizedQuery = normalizeCoinSearchQuery(query);

  if (!normalizedQuery) {
    return true;
  }

  const normalizedSearchQuery = normalizedQuery.toLocaleLowerCase();

  return (
    normalizeText(coin.name).includes(normalizedSearchQuery) ||
    normalizeText(coin.symbol).includes(normalizedSearchQuery)
  );
};

const compareNullableNumbers = (leftValue: number | null, rightValue: number | null): number => {
  if (leftValue === null && rightValue === null) {
    return 0;
  }

  if (leftValue === null) {
    return 1;
  }

  if (rightValue === null) {
    return -1;
  }

  return leftValue - rightValue;
};

export const sortCoinsByRequestParams = (
  coins: WatchlistCoin[],
  params?: Pick<CoinCollectionRequestParams, "sortBy" | "order">
): WatchlistCoin[] => {
  const backendSortKey = getBackendCoinSortKey(params?.sortBy) ?? "marketCap";
  const direction: CoinTableSortDirection = params?.order ?? "desc";

  return [...coins].sort((leftCoin, rightCoin) => {
    const comparisonResult =
      backendSortKey === "price"
        ? compareNullableNumbers(leftCoin.priceUsd, rightCoin.priceUsd)
        : backendSortKey === "percentChange24h"
          ? compareNullableNumbers(leftCoin.change24hPercent, rightCoin.change24hPercent)
          : compareNullableNumbers(leftCoin.marketCapUsd, rightCoin.marketCapUsd);

    if (comparisonResult !== 0) {
      return direction === "asc" ? comparisonResult : comparisonResult * -1;
    }

    return leftCoin.symbol.localeCompare(rightCoin.symbol, "en", {
      sensitivity: "base"
    });
  });
};

export const paginateCoins = <TCoin>(
  allCoins: TCoin[],
  params: PaginationOptions
) => {
  const pageSize = params.pageSize ?? params.defaultPageSize;
  const pageNo = params.pageNo ?? 0;
  const start = pageNo * pageSize;
  const coins = allCoins.slice(start, start + pageSize);

  return {
    coins,
    pageSize,
    pageNo,
    hasMore: start + coins.length < allCoins.length
  };
};

export const sortCoinHistoryByRequestParams = (
  historyEntries: CoinHistoryEntry[],
  params?: Pick<CoinHistoryRequestParams, "sortBy" | "order">
): CoinHistoryEntry[] => {
  const sortBy = params?.sortBy ?? "timestamp";
  const direction: CoinTableSortDirection = params?.order ?? "desc";

  return [...historyEntries].sort((leftEntry, rightEntry) => {
    const comparisonResult =
      sortBy === "priceUsd"
        ? leftEntry.priceUsd - rightEntry.priceUsd
        : sortBy === "volume24hUsd"
          ? leftEntry.volume24hUsd - rightEntry.volume24hUsd
          : Date.parse(leftEntry.timestamp) - Date.parse(rightEntry.timestamp);

    if (comparisonResult !== 0) {
      return direction === "asc" ? comparisonResult : comparisonResult * -1;
    }

    return leftEntry.timestamp.localeCompare(rightEntry.timestamp);
  });
};

export const buildSearchCoinsAppliedFilters = (
  params?: SearchCoinsRequestParams
): SearchCoinsAppliedFilters => ({
  query: normalizeCoinSearchQuery(params?.query),
  sortBy: getServerCoinTableSortKey(params?.sortBy) ?? "marketCapUsd",
  order: params?.order ?? "desc",
  priceMin: params?.priceMin,
  priceMax: params?.priceMax,
  capMin: params?.capMin,
  capMax: params?.capMax,
  changeMin: params?.changeMin,
  changeMax: params?.changeMax,
  volumeMin: params?.volumeMin,
  volumeMax: params?.volumeMax
});
