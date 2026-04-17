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

const pickFirstDefined = (record: UnknownRecord, keys: string[]): unknown => {
  for (const key of keys) {
    if (record[key] !== undefined) {
      return record[key];
    }
  }

  return undefined;
};

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

const parseBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1 ? true : value === 0 ? false : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "true") {
    return true;
  }

  if (normalizedValue === "false") {
    return false;
  }

  return null;
};

const parseString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue ? normalizedValue : null;
};

const unwrapResponseRecord = (payload: unknown): UnknownRecord => {
  if (!isRecord(payload)) {
    throw createShapeError("payload");
  }

  const nestedData = payload.data;

  if (
    nestedData !== undefined &&
    isRecord(nestedData) &&
    (nestedData.coins !== undefined || nestedData.items !== undefined)
  ) {
    return nestedData;
  }

  return payload;
};

const normalizeCoin = (payload: unknown): WatchlistCoin => {
  if (!isRecord(payload)) {
    throw createShapeError("coin");
  }

  const symbol = parseString(pickFirstDefined(payload, ["symbol", "ticker"]));

  if (!symbol) {
    throw createShapeError("coin.symbol");
  }

  const name = parseString(payload.name) ?? symbol;

  return {
    symbol,
    name,
    priceUsd: parseNumber(pickFirstDefined(payload, ["priceUsd", "price"])),
    change24hPercent: parseNumber(
      pickFirstDefined(payload, ["change24hPercent", "percentChange24h", "change24h", "change"])
    ),
    marketCapUsd: parseNumber(pickFirstDefined(payload, ["marketCapUsd", "marketCap", "cap"])),
    volume24hUsd: parseNumber(pickFirstDefined(payload, ["volume24hUsd", "volume24h", "volume"])),
    isFavorite:
      parseBoolean(pickFirstDefined(payload, ["isFavorite", "favorite", "inFavorites"])) ?? false
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
  const responseRecord = unwrapResponseRecord(payload);
  const rawCoins = pickFirstDefined(responseRecord, ["coins", "items"]);

  if (!Array.isArray(rawCoins)) {
    throw createShapeError("coins");
  }

  const coins = rawCoins.map(normalizeCoin);
  const totalCount = parseNumber(pickFirstDefined(responseRecord, ["totalCount", "count", "total"]));
  const hasMore = parseBoolean(pickFirstDefined(responseRecord, ["hasMore", "hasNext"])) ?? false;

  return {
    coins,
    totalCount: totalCount ?? coins.length,
    hasMore
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
    refreshedCount: parseNumber(payload.refreshedCount) ?? 0
  };
};

export const normalizeCoinsMutationResponse = normalizeMutationResponse;
