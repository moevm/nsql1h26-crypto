import { authorizedHttpClient } from "@/services/authorized-http-client";
import {
  normalizeCoinsMutationResponse,
  normalizeRefreshWatchlistResponse,
  normalizeWatchlistResponse
} from "@/services/coins/backend-coins-normalizer";
import type { CoinsApi } from "@/types/coins";

const encodeSymbol = (symbol: string): string => encodeURIComponent(symbol);

export const backendCoinsService: CoinsApi = {
  async getWatchlist() {
    const response = await authorizedHttpClient.get<unknown>("/api/coins/watchlist");

    return normalizeWatchlistResponse(response);
  },
  async refreshWatchlist() {
    const response = await authorizedHttpClient.post<unknown>("/api/coins/refresh");

    return normalizeRefreshWatchlistResponse(response);
  },
  async addFavorite(symbol: string) {
    const response = await authorizedHttpClient.post<unknown>("/api/coins/favorites", {
      body: { symbol }
    });

    return normalizeCoinsMutationResponse(response);
  },
  async removeFavorite(symbol: string) {
    const response = await authorizedHttpClient.delete<unknown>(
      `/api/coins/favorites/${encodeSymbol(symbol)}`
    );

    return normalizeCoinsMutationResponse(response);
  },
  async removeFromWatchlist(symbol: string) {
    const response = await authorizedHttpClient.delete<unknown>(
      `/api/coins/watchlist/${encodeSymbol(symbol)}`
    );

    return normalizeCoinsMutationResponse(response);
  }
};
