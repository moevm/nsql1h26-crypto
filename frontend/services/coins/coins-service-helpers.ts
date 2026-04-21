import type {
  CoinCollectionRequestParams,
  CoinNumericFilterParams,
  CoinTableSortDirection,
  FavoritesRequestParams,
  SearchCoinsAppliedFilters,
  SearchCoinsRequestParams,
  WatchlistCoin
} from "@/types/coins";
import { getBackendCoinSortKey, getServerCoinTableSortKey } from "@/utils/coin-table-sorting";

type QueryParams = Record<string, string | number | boolean | undefined>;

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
