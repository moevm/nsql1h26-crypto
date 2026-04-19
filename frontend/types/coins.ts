export interface WatchlistCoin {
  symbol: string;
  name: string;
  priceUsd: number | null;
  change24hPercent: number | null;
  marketCapUsd: number | null;
  volume24hUsd: number | null;
  isFavorite: boolean;
}

export interface CoinFilterRangeValue {
  start: string;
  end: string;
}

export type CoinFilterRangeKey = "price" | "cap" | "change" | "volume";
export type CoinFilterRangeEdge = keyof CoinFilterRangeValue;
export type CoinFilterRangesState = Record<CoinFilterRangeKey, CoinFilterRangeValue>;

export type CoinTableSortKey =
  | "name"
  | "priceUsd"
  | "change24hPercent"
  | "marketCapUsd"
  | "volume24hUsd";

export type CoinTableSortDirection = "asc" | "desc";

export interface CoinTableSortState {
  key: CoinTableSortKey;
  direction: CoinTableSortDirection;
}

export interface WatchlistRequestParams {
  pageSize?: number;
  pageNo?: number;
}

export interface FavoritesRequestParams {
  pageSize?: number;
  pageNo?: number;
  sortBy?: CoinTableSortKey;
  order?: CoinTableSortDirection;
  priceMin?: number;
  priceMax?: number;
  capMin?: number;
  capMax?: number;
  changeMin?: number;
  changeMax?: number;
  volumeMin?: number;
  volumeMax?: number;
}

export interface WatchlistResponse {
  coins: WatchlistCoin[];
  totalCount: number;
  hasMore: boolean;
  updatedAt: string | null;
}

export interface FavoritesResponse {
  coins: WatchlistCoin[];
  totalCount: number;
  pageSize: number;
  pageNo: number;
  hasMore: boolean;
}

export interface RefreshWatchlistResponse {
  success: boolean;
  refreshedCount: number;
  message?: string;
  lastUpdatedAt?: string | null;
}

export interface AddToWatchlistCoinInfo {
  symbol: string;
  name: string;
}

export interface AddToWatchlistResponse {
  success: boolean;
  message?: string;
  coin?: AddToWatchlistCoinInfo;
}

export interface CoinsMutationResponse {
  success: boolean;
  message?: string;
}

export interface CoinsApi {
  getWatchlist(params?: WatchlistRequestParams): Promise<WatchlistResponse>;
  getFavorites(params?: FavoritesRequestParams): Promise<FavoritesResponse>;
  refreshWatchlist(): Promise<RefreshWatchlistResponse>;
  addToWatchlist(symbol: string): Promise<AddToWatchlistResponse>;
  addFavorite(symbol: string): Promise<CoinsMutationResponse>;
  removeFavorite(symbol: string): Promise<CoinsMutationResponse>;
  removeFromWatchlist(symbol: string): Promise<CoinsMutationResponse>;
}
