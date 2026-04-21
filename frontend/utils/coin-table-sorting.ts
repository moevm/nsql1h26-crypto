import type {
  CoinTableSortKey,
  CoinTableSortState,
  ServerCoinTableSortKey
} from "@/types/coins";

export type BackendCoinSortKey = "price" | "percentChange24h" | "marketCap";

export const DEFAULT_COIN_TABLE_SORTABLE_COLUMNS: readonly CoinTableSortKey[] = [
  "name",
  "priceUsd",
  "change24hPercent",
  "marketCapUsd",
  "volume24hUsd"
];

export const SERVER_COIN_TABLE_SORTABLE_COLUMNS: readonly ServerCoinTableSortKey[] = [
  "priceUsd",
  "change24hPercent",
  "marketCapUsd"
];

export const FAVORITES_COIN_TABLE_SORTABLE_COLUMNS = SERVER_COIN_TABLE_SORTABLE_COLUMNS;

const BACKEND_COIN_SORT_KEY_BY_TABLE_KEY: Record<ServerCoinTableSortKey, BackendCoinSortKey> = {
  priceUsd: "price",
  change24hPercent: "percentChange24h",
  marketCapUsd: "marketCap"
};

const TABLE_KEY_BY_BACKEND_COIN_SORT_KEY: Record<BackendCoinSortKey, ServerCoinTableSortKey> = {
  price: "priceUsd",
  percentChange24h: "change24hPercent",
  marketCap: "marketCapUsd"
};

export const getServerCoinTableSortKey = (
  sortKey?: CoinTableSortKey
): ServerCoinTableSortKey | undefined => {
  if (!sortKey) {
    return undefined;
  }

  return Object.prototype.hasOwnProperty.call(BACKEND_COIN_SORT_KEY_BY_TABLE_KEY, sortKey)
    ? (sortKey as ServerCoinTableSortKey)
    : undefined;
};

export const getBackendCoinSortKey = (
  sortKey?: CoinTableSortKey
): BackendCoinSortKey | undefined => {
  const serverSortKey = getServerCoinTableSortKey(sortKey);

  return serverSortKey ? BACKEND_COIN_SORT_KEY_BY_TABLE_KEY[serverSortKey] : undefined;
};

export const getTableSortKeyFromBackendCoinSortKey = (
  sortKey?: string
): ServerCoinTableSortKey | undefined => {
  if (!sortKey) {
    return undefined;
  }

  return TABLE_KEY_BY_BACKEND_COIN_SORT_KEY[sortKey as BackendCoinSortKey];
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
