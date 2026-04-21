import { authorizedHttpClient } from "@/services/http/authorized-http-client";
import {
  normalizeAddToWatchlistResponse,
  normalizeCoinsMutationResponse,
  normalizeFavoritesResponse,
  normalizeRefreshWatchlistResponse,
  normalizeSearchCoinsResponse
} from "@/services/coins/backend-coins-normalizer";
import {
  buildFavoritesQueryParams,
  buildSearchCoinsQueryParams
} from "@/services/coins/coins-service-helpers";
import type {
  CoinsApi,
  FavoritesRequestParams,
  SearchCoinsRequestParams
} from "@/types/coins";

export const backendCoinsService: CoinsApi = {
  async getFavorites(params?: FavoritesRequestParams) {
    const response = await authorizedHttpClient.get<unknown>("/api/coins/favorites", {
      params: buildFavoritesQueryParams(params)
    });

    return normalizeFavoritesResponse(response);
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
