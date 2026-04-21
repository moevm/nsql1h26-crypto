import { ApiError } from "@/services/http/http-client";
import type {
  AddToWatchlistResponse,
  CoinsApi,
  CoinsMutationResponse,
  FavoritesRequestParams,
  FavoritesResponse,
  SearchCoinsRequestParams,
  SearchCoinsResponse,
  WatchlistCoin
} from "@/types/coins";
import {
  buildSearchCoinsAppliedFilters,
  matchesCoinNumericFilters,
  matchesCoinSearchQuery,
  paginateCoins,
  sortCoinsByRequestParams
} from "@/services/coins/coins-service-helpers";
import { authStorage } from "@/utils/auth-storage";
import { mockAuthStore, type MockStoredUser } from "@/utils/mocks/mock-auth-store";
import { mockCoinCatalog } from "@/utils/mocks/mock-coin-catalog";

const mockCoinsBySymbol = new Map(mockCoinCatalog.map((coin) => [coin.symbol, coin]));

const throwCoinsError = (status: number, message: string): never => {
  throw new ApiError({ status, message });
};

const normalizeSymbol = (symbol: string): string => symbol.trim().toUpperCase();

const getCurrentMockUser = (): MockStoredUser => {
  const token = authStorage.getToken();

  if (!token) {
    return throwCoinsError(401, "Unauthorized");
  }

  const user = mockAuthStore.findUserByToken(token);

  if (!user) {
    return throwCoinsError(401, "Unauthorized");
  }

  return user;
};

const buildWatchlistCoins = (user: MockStoredUser): WatchlistCoin[] => {
  return user.watchlist.flatMap((symbol) => {
    const coin = mockCoinsBySymbol.get(symbol);

    if (!coin) {
      return [];
    }

    return [
      {
        ...coin,
        isFavorite: user.favorites.includes(symbol)
      }
    ];
  });
};

const buildFavoriteCoins = (user: MockStoredUser): WatchlistCoin[] => {
  return user.favorites.flatMap((symbol) => {
    const coin = mockCoinsBySymbol.get(symbol);

    if (!coin) {
      return [];
    }

    return [
      {
        ...coin,
        isFavorite: true
      }
    ];
  });
};

const createMutationResponse = (message?: string): CoinsMutationResponse => ({
  success: true,
  message
});

const createAddToWatchlistResponse = (
  symbol: string,
  name: string,
  message?: string
): AddToWatchlistResponse => ({
  success: true,
  message,
  coin: {
    symbol,
    name
  }
});

const saveMockUser = (nextUser: MockStoredUser): MockStoredUser => {
  mockAuthStore.replaceUser(nextUser);

  return nextUser;
};

const updateCurrentMockUser = (
  updater: (user: MockStoredUser, normalizedSymbol: string) => MockStoredUser,
  symbol: string
): MockStoredUser => {
  const currentUser = getCurrentMockUser();
  const normalizedSymbol = normalizeSymbol(symbol);

  if (!normalizedSymbol) {
    return throwCoinsError(400, "Symbol is required");
  }

  if (!mockCoinsBySymbol.has(normalizedSymbol)) {
    return throwCoinsError(400, "Coin not found");
  }

  return saveMockUser(updater(currentUser, normalizedSymbol));
};

const buildSearchCoins = (user: MockStoredUser): WatchlistCoin[] => {
  return mockCoinCatalog.map((coin) => ({
    ...coin,
    isFavorite: user.favorites.includes(coin.symbol)
  }));
};

export const mockCoinsService: CoinsApi = {
  async getFavorites(params?: FavoritesRequestParams): Promise<FavoritesResponse> {
    const user = getCurrentMockUser();
    const filteredCoins = buildFavoriteCoins(user).filter((coin) =>
      matchesCoinNumericFilters(coin, params)
    );
    const sortedCoins = sortCoinsByRequestParams(filteredCoins, params);
    const pagedResult = paginateCoins(sortedCoins, {
      pageSize: params?.pageSize,
      pageNo: params?.pageNo,
      defaultPageSize: 10
    });

    return {
      coins: pagedResult.coins,
      totalCount: sortedCoins.length,
      pageSize: pagedResult.pageSize,
      pageNo: pagedResult.pageNo,
      hasMore: pagedResult.hasMore
    };
  },
  async searchCoins(params?: SearchCoinsRequestParams): Promise<SearchCoinsResponse> {
    const user = getCurrentMockUser();
    const filteredCoins = buildSearchCoins(user).filter(
      (coin) =>
        matchesCoinSearchQuery(coin, params?.query) &&
        matchesCoinNumericFilters(coin, params)
    );
    const sortedCoins = sortCoinsByRequestParams(filteredCoins, params);
    const pagedResult = paginateCoins(sortedCoins, {
      pageSize: params?.pageSize,
      pageNo: params?.pageNo,
      defaultPageSize: 10
    });

    return {
      coins: pagedResult.coins,
      totalCount: sortedCoins.length,
      pageSize: pagedResult.pageSize,
      pageNo: pagedResult.pageNo,
      hasMore: pagedResult.hasMore,
      appliedFilters: buildSearchCoinsAppliedFilters(params)
    };
  },
  async refreshWatchlist() {
    const user = getCurrentMockUser();

    return {
      success: true,
      refreshedCount: buildWatchlistCoins(user).length,
      message: "Watchlist data refreshed"
    };
  },
  async addToWatchlist(symbol: string) {
    updateCurrentMockUser((user, normalizedSymbol) => {
      if (user.watchlist.includes(normalizedSymbol)) {
        return throwCoinsError(400, "Coin already in watchlist");
      }

      return {
        ...user,
        watchlist: [...user.watchlist, normalizedSymbol]
      };
    }, symbol);

    const normalizedSymbol = normalizeSymbol(symbol);
    const coin = mockCoinsBySymbol.get(normalizedSymbol);

    if (!coin) {
      return throwCoinsError(400, "Coin not found");
    }

    return createAddToWatchlistResponse(
      normalizedSymbol,
      coin.name,
      `${normalizedSymbol} added to watchlist`
    );
  },
  async addFavorite(symbol: string) {
    updateCurrentMockUser((user, normalizedSymbol) => {
      if (!user.watchlist.includes(normalizedSymbol)) {
        return throwCoinsError(400, "Coin is not in watchlist");
      }

      if (user.favorites.includes(normalizedSymbol)) {
        return user;
      }

      return {
        ...user,
        favorites: [...user.favorites, normalizedSymbol]
      };
    }, symbol);

    return createMutationResponse("Coin added to favorites");
  },
  async removeFavorite(symbol: string) {
    updateCurrentMockUser(
      (user, normalizedSymbol) => ({
        ...user,
        favorites: user.favorites.filter((favoriteSymbol) => favoriteSymbol !== normalizedSymbol)
      }),
      symbol
    );

    return createMutationResponse("Coin removed from favorites");
  },
  async removeFromWatchlist(symbol: string) {
    updateCurrentMockUser(
      (user, normalizedSymbol) => ({
        ...user,
        watchlist: user.watchlist.filter((watchlistSymbol) => watchlistSymbol !== normalizedSymbol),
        favorites: user.favorites.filter((favoriteSymbol) => favoriteSymbol !== normalizedSymbol)
      }),
      symbol
    );

    return createMutationResponse("Coin removed from watchlist");
  }
};
