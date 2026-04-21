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
export type ServerCoinTableSortKey = Extract<
  CoinTableSortKey,
  "priceUsd" | "change24hPercent" | "marketCapUsd"
>;

export interface CoinTableSortState {
  key: CoinTableSortKey;
  direction: CoinTableSortDirection;
}

export interface CoinNumericFilterParams {
  priceMin?: number;
  priceMax?: number;
  capMin?: number;
  capMax?: number;
  changeMin?: number;
  changeMax?: number;
  volumeMin?: number;
  volumeMax?: number;
}

export interface CoinCollectionRequestParams extends CoinNumericFilterParams {
  pageSize?: number;
  pageNo?: number;
  sortBy?: CoinTableSortKey;
  order?: CoinTableSortDirection;
}

export interface FavoritesRequestParams extends CoinCollectionRequestParams {}

export interface SearchCoinsRequestParams extends CoinCollectionRequestParams {
  query?: string;
}

export interface PaginatedCoinsResponse {
  coins: WatchlistCoin[];
  totalCount: number;
  pageSize: number;
  pageNo: number;
  hasMore: boolean;
}

export interface FavoritesResponse extends PaginatedCoinsResponse {}

export interface SearchCoinsAppliedFilters {
  query?: string;
  sortBy: ServerCoinTableSortKey;
  order: CoinTableSortDirection;
  priceMin?: number;
  priceMax?: number;
  capMin?: number;
  capMax?: number;
  changeMin?: number;
  changeMax?: number;
  volumeMin?: number;
  volumeMax?: number;
}

export interface SearchCoinsResponse extends PaginatedCoinsResponse {
  appliedFilters: SearchCoinsAppliedFilters;
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
  getFavorites(params?: FavoritesRequestParams): Promise<FavoritesResponse>;
  searchCoins(params?: SearchCoinsRequestParams): Promise<SearchCoinsResponse>;
  refreshWatchlist(): Promise<RefreshWatchlistResponse>;
  addToWatchlist(symbol: string): Promise<AddToWatchlistResponse>;
  addFavorite(symbol: string): Promise<CoinsMutationResponse>;
  removeFavorite(symbol: string): Promise<CoinsMutationResponse>;
  removeFromWatchlist(symbol: string): Promise<CoinsMutationResponse>;
}
