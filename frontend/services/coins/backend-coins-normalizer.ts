import { ApiError } from "@/services/http-client";
import type {
  CoinsMutationResponse,
  RefreshWatchlistResponse,
  WatchlistCoin,
  WatchlistResponse
} from "@/types/coins";

type UnknownRecord = Record<string, unknown>;

const INVALID_RESPONSE_MESSAGE = "Invalid coins API response";

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const createShapeError = (fieldName: string): ApiError =>
  new ApiError({
    status: 500,
    message: `${INVALID_RESPONSE_MESSAGE}: ${fieldName}`
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
    isFavorite: parseBoolean(payload.isFavorite) ?? false
  };
};

const normalizeMutationResponse = (payload: unknown): CoinsMutationResponse => {
  if (!isRecord(payload)) {
    return { success: true };
  }

  return {
    success: parseBoolean(payload.success) ?? true,
    message: parseString(payload.message) ?? undefined
  };
};

export const normalizeWatchlistResponse = (payload: unknown): WatchlistResponse => {
  if (!isRecord(payload)) {
    throw createShapeError("payload");
  }

  const rawCoins = payload.coins;

  if (!Array.isArray(rawCoins)) {
    throw createShapeError("coins");
  }

  const coins = rawCoins.map(normalizeCoin);
  const totalCount = parseNumber(payload.totalCount);
  const hasMore = parseBoolean(payload.hasMore) ?? false;

  return {
    coins,
    totalCount: totalCount ?? coins.length,
    hasMore,
    updatedAt: parseIsoDateString(payload.updatedAt)
  };
};

export const normalizeRefreshWatchlistResponse = (payload: unknown): RefreshWatchlistResponse => {
  const mutationResult = normalizeMutationResponse(payload);

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

export const normalizeCoinsMutationResponse = normalizeMutationResponse;
