import { authorizedHttpClient } from "@/services/http/authorized-http-client";
import {
  normalizeAddToWatchlistResponse,
  normalizeCoinsMutationResponse,
  normalizeFavoritesResponse,
  normalizeRefreshWatchlistResponse,
  normalizeWatchlistResponse
} from "@/services/coins/backend-coins-normalizer";
import type { CoinsApi, FavoritesRequestParams, WatchlistRequestParams } from "@/types/coins";
import { getFavoritesBackendSortKey } from "@/utils/coin-table-sorting";

export const backendCoinsService: CoinsApi = {
  async getWatchlist(params?: WatchlistRequestParams) {
    const queryParams = params
      ? {
          pageNo: params.pageNo,
          pageSize: params.pageSize
        }
      : undefined;

    const response = await authorizedHttpClient.get<unknown>("/api/coins/watchlist", {
      params: queryParams
    });

    return normalizeWatchlistResponse(response);
  },
  async getFavorites(params?: FavoritesRequestParams) {
    const queryParams = params
      ? {
          pageNo: params.pageNo,
          pageSize: params.pageSize,
          sortBy: getFavoritesBackendSortKey(params.sortBy),
          order: params.order,
          priceMin: params.priceMin,
          priceMax: params.priceMax,
          capMin: params.capMin,
          capMax: params.capMax,
          changeMin: params.changeMin,
          changeMax: params.changeMax,
          volumeMin: params.volumeMin,
          volumeMax: params.volumeMax
        }
      : undefined;

    const response = await authorizedHttpClient.get<unknown>("/api/coins/favorites", {
      params: queryParams
    });

    return normalizeFavoritesResponse(response);
  },
  async refreshWatchlist() {
    const response = await authorizedHttpClient.post<unknown>("/api/coins/refresh");

    return normalizeRefreshWatchlistResponse(response);
  },
  async addToWatchlist(symbol: string) {
    const response = await authorizedHttpClient.post<unknown>("/api/coins/watchlist", {
      body: { symbol }
    });

    return normalizeAddToWatchlistResponse(response);
  },
  async addFavorite(symbol: string) {
    const response = await authorizedHttpClient.post<unknown>("/api/coins/favorites", {
      body: { symbol }
    });

    return normalizeCoinsMutationResponse(response);
  },
  async removeFavorite(symbol: string) {
    const response = await authorizedHttpClient.delete<unknown>(
      `/api/coins/favorites/${encodeURIComponent(symbol)}`
    );

    return normalizeCoinsMutationResponse(response);
  },
  async removeFromWatchlist(symbol: string) {
    const response = await authorizedHttpClient.delete<unknown>(
      `/api/coins/watchlist/${encodeURIComponent(symbol)}`
    );

    return normalizeCoinsMutationResponse(response);
  }
};
