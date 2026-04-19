import type { CoinTableSortKey } from "@/types/coins";

type FavoritesBackendSortKey = "price" | "percentChange24h" | "marketCap";

export const DEFAULT_COIN_TABLE_SORTABLE_COLUMNS: readonly CoinTableSortKey[] = [
  "name",
  "priceUsd",
  "change24hPercent",
  "marketCapUsd",
  "volume24hUsd"
];

export const FAVORITES_COIN_TABLE_SORTABLE_COLUMNS: readonly CoinTableSortKey[] = [
  "priceUsd",
  "change24hPercent",
  "marketCapUsd"
];

const FAVORITES_BACKEND_SORT_KEY_BY_TABLE_KEY: Partial<
  Record<CoinTableSortKey, FavoritesBackendSortKey>
> = {
  priceUsd: "price",
  change24hPercent: "percentChange24h",
  marketCapUsd: "marketCap"
};

export const getFavoritesBackendSortKey = (
  sortKey?: CoinTableSortKey
): FavoritesBackendSortKey | undefined => {
  if (!sortKey) {
    return undefined;
  }

  return FAVORITES_BACKEND_SORT_KEY_BY_TABLE_KEY[sortKey];
};
