export interface WatchlistCoin {
  symbol: string;
  name: string;
  priceUsd: number | null;
  change24hPercent: number | null;
  marketCapUsd: number | null;
  volume24hUsd: number | null;
  isFavorite: boolean;
}

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

export interface WatchlistResponse {
  coins: WatchlistCoin[];
  totalCount: number;
  hasMore: boolean;
}

export interface RefreshWatchlistResponse {
  success: boolean;
  refreshedCount: number;
  message?: string;
}

export interface CoinsMutationResponse {
  success: boolean;
  message?: string;
}

export interface CoinsApi {
  getWatchlist(): Promise<WatchlistResponse>;
  refreshWatchlist(): Promise<RefreshWatchlistResponse>;
  addFavorite(symbol: string): Promise<CoinsMutationResponse>;
  removeFavorite(symbol: string): Promise<CoinsMutationResponse>;
  removeFromWatchlist(symbol: string): Promise<CoinsMutationResponse>;
}
