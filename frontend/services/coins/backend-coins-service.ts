import { authorizedHttpClient } from "@/services/http/authorized-http-client";
import {
  normalizeAddToWatchlistResponse,
  normalizeCoinDetailsResponse,
  normalizeCoinHistoryResponse,
  normalizeCoinsMutationResponse,
  normalizeFavoritesResponse,
  normalizeRefreshWatchlistResponse,
  normalizeSearchCoinsResponse,
  normalizeWatchlistResponse
} from "@/services/coins/backend-coins-normalizer";
import {
  buildCoinHistoryQueryParams,
  buildFavoritesQueryParams,
  buildSearchCoinsQueryParams
} from "@/services/coins/coins-service-helpers";
import type {
  CoinHistoryRequestParams,
  CoinsApi,
  FavoritesRequestParams,
  SearchCoinsRequestParams,
  WatchlistRequestParams
} from "@/types/coins";

export const backendCoinsService: CoinsApi = {
  async getWatchlist(params?: WatchlistRequestParams) {
    const response = await authorizedHttpClient.get<unknown>("/api/coins/watchlist", {
      params: params ? { pageSize: params.pageSize, pageNo: params.pageNo } : undefined
    });

    return normalizeWatchlistResponse(response, params?.pageNo, params?.pageSize);
  },
  async getFavorites(params?: FavoritesRequestParams) {
    const response = await authorizedHttpClient.get<unknown>("/api/coins/favorites", {
      params: buildFavoritesQueryParams(params)
    });

    return normalizeFavoritesResponse(response);
  },
  async getCoinDetails(symbol: string) {
    const response = await authorizedHttpClient.get<unknown>(
      `/api/coins/${encodeURIComponent(symbol)}`
    );

    return normalizeCoinDetailsResponse(response);
  },
  async getCoinHistory(symbol: string, params?: CoinHistoryRequestParams) {
    const response = await authorizedHttpClient.get<unknown>(
      `/api/coins/${encodeURIComponent(symbol)}/history`,
      {
        params: buildCoinHistoryQueryParams(params)
      }
    );

    return normalizeCoinHistoryResponse(response);
  },
  async searchCoins(params?: SearchCoinsRequestParams) {
    const response = await authorizedHttpClient.get<unknown>("/api/coins/search", {
      params: buildSearchCoinsQueryParams(params)
    });

    return normalizeSearchCoinsResponse(response);
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
