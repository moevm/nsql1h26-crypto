import type {
  CoinCollectionRequestParams,
  CoinHistoryRequestParams,
  CoinHistorySortKey,
  FavoritesRequestParams,
  SearchCoinsRequestParams,
  WatchlistRequestParams
} from "@/types/coins";
import { getBackendCoinSortKey } from "@/utils/coin-table-sorting";

type QueryParams = Record<string, string | number | boolean | undefined>;
type BackendCoinHistorySortKey = "timestamp" | "price" | "volume24h";

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

export const buildWatchlistQueryParams = (
  params?: WatchlistRequestParams
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
