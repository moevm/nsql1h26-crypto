import { ApiError } from "@/services/http/http-client";
import type {
  AddToWatchlistCoinInfo,
  AddToWatchlistResponse,
  CoinDetails,
  CoinHistoryDateRange,
  CoinHistoryEntry,
  CoinHistoryResponse,
  CoinsMutationResponse,
  FavoritesResponse,
  RefreshWatchlistResponse,
  SearchCoinsAppliedFilters,
  SearchCoinsResponse,
  WatchlistCoin
} from "@/types/coins";
import { getTableSortKeyFromBackendCoinSortKey } from "@/utils/coin-table-sorting";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const createShapeError = (fieldName: string): ApiError =>
  new ApiError({
    status: 500,
    message: `Invalid coins API response: ${fieldName}`
  });

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.replace(/[$,%\s,]/g, "");

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const parseBoolean = (value: unknown): boolean | null => (typeof value === "boolean" ? value : null);

const parseString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue ? normalizedValue : null;
};

const parseIsoDateString = (value: unknown): string | null => {
  let parsedValue: string | null = null;

  if (value instanceof Date) {
    parsedValue = value.toISOString();
  } else if (typeof value === "number" && Number.isFinite(value)) {
    parsedValue = new Date(value).toISOString();
  } else {
    parsedValue = parseString(value);
  }

  if (!parsedValue) {
    return null;
  }

  return Number.isNaN(Date.parse(parsedValue)) ? null : parsedValue;
};

const parseRequiredNumber = (value: unknown, fieldName: string): number => {
  const parsedValue = parseNumber(value);

  if (parsedValue === null) {
    throw createShapeError(fieldName);
  }

  return parsedValue;
};

const parseRequiredBoolean = (value: unknown, fieldName: string): boolean => {
  const parsedValue = parseBoolean(value);

  if (parsedValue === null) {
    throw createShapeError(fieldName);
  }

  return parsedValue;
};

const parseFavorite = (payload: UnknownRecord, fieldName: string): boolean => {
  const value = payload.isFavorite ?? payload.favorite;

  return parseRequiredBoolean(value, fieldName);
};

const parseRequiredString = (value: unknown, fieldName: string): string => {
  const parsedValue = parseString(value);

  if (!parsedValue) {
    throw createShapeError(fieldName);
  }

  return parsedValue;
};

const parseRequiredIsoDateString = (value: unknown, fieldName: string): string => {
  const parsedValue = parseIsoDateString(value);

  if (!parsedValue) {
    throw createShapeError(fieldName);
  }

  return parsedValue;
};

const normalizeCoin = (payload: unknown): WatchlistCoin => {
  if (!isRecord(payload)) {
    throw createShapeError("coin");
  }

  const symbol = parseString(payload.symbol);

  if (!symbol) {
    throw createShapeError("coin.symbol");
  }

  const name = parseString(payload.name) ?? symbol;

  return {
    symbol,
    name,
    priceUsd: parseNumber(payload.price),
    change24hPercent: parseNumber(payload.percentChange24h),
    marketCapUsd: parseNumber(payload.marketCap),
    volume24hUsd: parseNumber(payload.volume24h),
    isFavorite: parseBoolean(payload.isFavorite ?? payload.favorite) ?? false
  };
};

const normalizeAddToWatchlistCoin = (payload: unknown): AddToWatchlistCoinInfo => {
  if (!isRecord(payload)) {
    throw createShapeError("coin");
  }

  const symbol = parseString(payload.symbol);

  if (!symbol) {
    throw createShapeError("coin.symbol");
  }

  return {
    symbol,
    name: parseString(payload.name) ?? symbol
  };
};

interface NormalizedCoinCollectionPayload {
  coins: WatchlistCoin[];
  totalCount: number;
  hasMore: boolean;
  pageNo: number;
  pageSize: number;
}

const normalizeCoinCollectionPayload = (payload: unknown): NormalizedCoinCollectionPayload => {
  if (!isRecord(payload)) {
    throw createShapeError("payload");
  }

  const rawCoins = payload.coins;

  if (!Array.isArray(rawCoins)) {
    throw createShapeError("coins");
  }

  const coins = rawCoins.map(normalizeCoin);
  const totalCount = parseNumber(payload.totalCount);
  const pageNo = parseNumber(payload.pageNo);
  const pageSize = parseNumber(payload.pageSize);

  return {
    coins,
    totalCount: totalCount ?? coins.length,
    hasMore: parseBoolean(payload.hasMore) ?? false,
    pageNo: pageNo ?? 0,
    pageSize: pageSize ?? coins.length
  };
};

export const normalizeCoinsMutationResponse = (payload: unknown): CoinsMutationResponse => {
  if (!isRecord(payload)) {
    return { success: true };
  }

  return {
    success: parseBoolean(payload.success) ?? true,
    message: parseString(payload.message) ?? undefined
  };
};

export const normalizeAddToWatchlistResponse = (payload: unknown): AddToWatchlistResponse => {
  if (!isRecord(payload)) {
    throw createShapeError("payload");
  }

  return {
    success: parseBoolean(payload.success) ?? true,
    message: parseString(payload.message) ?? undefined,
    coin:
      payload.coin === undefined || payload.coin === null
        ? undefined
        : normalizeAddToWatchlistCoin(payload.coin)
  };
};

export const normalizeFavoritesResponse = (payload: unknown): FavoritesResponse => {
  const normalizedCollection = normalizeCoinCollectionPayload(payload);

  return {
    coins: normalizedCollection.coins,
    totalCount: normalizedCollection.totalCount,
    pageNo: normalizedCollection.pageNo,
    pageSize: normalizedCollection.pageSize,
    hasMore: normalizedCollection.hasMore
  };
};

const normalizeSearchAppliedFilters = (payload: unknown): SearchCoinsAppliedFilters => {
  if (!isRecord(payload)) {
    throw createShapeError("appliedFilters");
  }

  const sortBy = getTableSortKeyFromBackendCoinSortKey(
    parseRequiredString(payload.sortBy, "appliedFilters.sortBy")
  );

  if (!sortBy) {
    throw createShapeError("appliedFilters.sortBy");
  }

  const order = parseRequiredString(payload.order, "appliedFilters.order");

  if (order !== "asc" && order !== "desc") {
    throw createShapeError("appliedFilters.order");
  }

  return {
    query: parseString(payload.query) ?? undefined,
    sortBy,
    order,
    priceMin: parseNumber(payload.priceMin) ?? undefined,
    priceMax: parseNumber(payload.priceMax) ?? undefined,
    capMin: parseNumber(payload.capMin) ?? undefined,
    capMax: parseNumber(payload.capMax) ?? undefined,
    changeMin: parseNumber(payload.changeMin) ?? undefined,
    changeMax: parseNumber(payload.changeMax) ?? undefined,
    volumeMin: parseNumber(payload.volumeMin) ?? undefined,
    volumeMax: parseNumber(payload.volumeMax) ?? undefined
  };
};

export const normalizeSearchCoinsResponse = (payload: unknown): SearchCoinsResponse => {
  if (!isRecord(payload)) {
    throw createShapeError("payload");
  }

  if (!Array.isArray(payload.coins)) {
    throw createShapeError("coins");
  }

  return {
    coins: payload.coins.map(normalizeCoin),
    totalCount: parseRequiredNumber(payload.totalCount, "totalCount"),
    pageNo: parseRequiredNumber(payload.pageNo, "pageNo"),
    pageSize: parseRequiredNumber(payload.pageSize, "pageSize"),
    hasMore: parseRequiredBoolean(payload.hasMore, "hasMore"),
    appliedFilters: normalizeSearchAppliedFilters(payload.appliedFilters)
  };
};

export const normalizeRefreshWatchlistResponse = (payload: unknown): RefreshWatchlistResponse => {
  const mutationResult = normalizeCoinsMutationResponse(payload);

  if (!isRecord(payload)) {
    return {
      ...mutationResult,
      refreshedCount: 0
    };
  }

  return {
    ...mutationResult,
    refreshedCount: parseNumber(payload.refreshedCount) ?? 0,
    lastUpdatedAt: parseIsoDateString(payload.lastUpdatedAt)
  };
};

export const normalizeCoinDetailsResponse = (payload: unknown): CoinDetails => {
  if (!isRecord(payload)) {
    throw createShapeError("payload");
  }

  const symbol = parseRequiredString(payload.symbol, "symbol");

  return {
    symbol,
    name: parseString(payload.name) ?? symbol,
    priceUsd: parseRequiredNumber(payload.price, "price"),
    change24hPercent: parseRequiredNumber(payload.percentChange24h, "percentChange24h"),
    marketCapUsd: parseRequiredNumber(payload.marketCap, "marketCap"),
    volume24hUsd: parseRequiredNumber(payload.volume24h, "volume24h"),
    minPrice7d: parseNumber(payload.minPrice7d),
    maxPrice7d: parseNumber(payload.maxPrice7d),
    avgPrice7d: parseNumber(payload.avgPrice7d),
    isFavorite: parseFavorite(payload, "isFavorite"),
    lastUpdatedAt: parseRequiredIsoDateString(payload.lastUpdated, "lastUpdated")
  };
};

const normalizeCoinHistoryEntry = (payload: unknown): CoinHistoryEntry => {
  if (!isRecord(payload)) {
    throw createShapeError("historyEntry");
  }

  return {
    timestamp: parseRequiredIsoDateString(payload.timestamp, "historyEntry.timestamp"),
    priceUsd: parseRequiredNumber(payload.price, "historyEntry.price"),
    marketCapUsd: parseRequiredNumber(payload.marketCap, "historyEntry.marketCap"),
    volume24hUsd: parseRequiredNumber(payload.volume24h, "historyEntry.volume24h"),
    change24hPercent: parseRequiredNumber(
      payload.percentChange24h,
      "historyEntry.percentChange24h"
    )
  };
};

const normalizeCoinHistoryDateRange = (payload: unknown): CoinHistoryDateRange => {
  if (!isRecord(payload)) {
    throw createShapeError("dateRange");
  }

  return {
    from:
      payload.from === undefined || payload.from === null
        ? null
        : parseRequiredIsoDateString(payload.from, "dateRange.from"),
    to:
      payload.to === undefined || payload.to === null
        ? null
        : parseRequiredIsoDateString(payload.to, "dateRange.to")
  };
};

export const normalizeCoinHistoryResponse = (payload: unknown): CoinHistoryResponse => {
  if (!isRecord(payload)) {
    throw createShapeError("payload");
  }

  const rawHistory = payload.history;

  if (!Array.isArray(rawHistory)) {
    throw createShapeError("history");
  }

  return {
    symbol: parseRequiredString(payload.symbol, "symbol"),
    history: rawHistory.map(normalizeCoinHistoryEntry),
    totalCount: parseRequiredNumber(payload.totalCount, "totalCount"),
    dateRange: normalizeCoinHistoryDateRange(payload.dateRange)
  };
};
