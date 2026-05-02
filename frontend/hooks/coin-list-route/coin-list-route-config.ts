import type {
  CoinFilterRangesState,
  CoinCollectionRequestParams,
  CoinTableSortState,
  ServerCoinTableSortKey
} from "@/types/coins";
import { SERVER_COIN_TABLE_SORTABLE_COLUMNS } from "@/utils/coin-table-sorting";

export type CoinListRouteMode = "watchlist" | "favorites";
export type CoinListRequestMode = "search" | "favorites";

export interface CoinListPageModeConfig {
  mode: CoinListRouteMode;
  pathname: string;
  requestMode: CoinListRequestMode;
  supportsTextQuery: boolean;
  defaultPageSize: number;
  defaultSort: CoinTableSortState & { key: ServerCoinTableSortKey };
  allowedSortKeys: readonly ServerCoinTableSortKey[];
}

export interface CoinListRouteFiltersDraft {
  query: string;
  ranges: CoinFilterRangesState;
}

export interface CoinListRouteAppliedState extends CoinListRouteFiltersDraft {
  sort: CoinTableSortState & { key: ServerCoinTableSortKey };
  page: number;
}

export type CoinListRouteRequestParams = CoinCollectionRequestParams & {
  query?: string;
};

const DEFAULT_SERVER_SORT: CoinTableSortState & { key: ServerCoinTableSortKey } = {
  key: "marketCapUsd",
  direction: "desc"
};

export const WATCHLIST_ROUTE_STATE_CONFIG: CoinListPageModeConfig = {
  mode: "watchlist",
  pathname: "/app",
  requestMode: "search",
  supportsTextQuery: false,
  defaultPageSize: 10,
  defaultSort: DEFAULT_SERVER_SORT,
  allowedSortKeys: [] as readonly ServerCoinTableSortKey[]
};

export const FAVORITES_ROUTE_STATE_CONFIG: CoinListPageModeConfig = {
  mode: "favorites",
  pathname: "/app/favorites",
  requestMode: "favorites",
  supportsTextQuery: false,
  defaultPageSize: 10,
  defaultSort: DEFAULT_SERVER_SORT,
  allowedSortKeys: SERVER_COIN_TABLE_SORTABLE_COLUMNS
};
