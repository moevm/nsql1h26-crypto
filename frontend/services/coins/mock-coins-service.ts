import { ApiError } from "@/services/http/http-client";
import type {
  AddToWatchlistResponse,
  CoinHistoryDateRange,
  CoinHistoryRequestParams,
  CoinHistoryResponse,
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
  matchesCoinHistoryFilters,
  matchesCoinNumericFilters,
  matchesCoinSearchQuery,
  paginateCoins,
  sortCoinHistoryByRequestParams,
  sortCoinsByRequestParams
} from "@/services/coins/coins-service-helpers";
import { authStorage } from "@/utils/auth-storage";
import { mockAuthStore, type MockStoredUser } from "@/utils/mocks/mock-auth-store";
import { mockCoinCatalog } from "@/utils/mocks/mock-coin-catalog";
import { getMockCoinHistory } from "@/utils/mocks/mock-coin-history";

const mockCoinsBySymbol = new Map(mockCoinCatalog.map((coin) => [coin.symbol, coin]));
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_HISTORY_PAGE_SIZE = 10;

const throwCoinsError = (status: number, message: string): never => {
  throw new ApiError({ status, message });
};

const normalizeSymbol = (symbol: string): string => symbol.trim().toUpperCase();

const normalizeHistoryDateParam = (value?: string): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return undefined;
  }

  const timestamp = Date.parse(normalizedValue);

  if (Number.isNaN(timestamp)) {
    return throwCoinsError(400, "Invalid date");
  }

  return new Date(timestamp).toISOString();
};

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

const getMockCatalogCoin = (symbol: string) => {
  const normalizedSymbol = normalizeSymbol(symbol);

  if (!normalizedSymbol) {
    return throwCoinsError(400, "Symbol is required");
  }

  const coin = mockCoinsBySymbol.get(normalizedSymbol);

  if (!coin) {
    return throwCoinsError(404, "Coin not found");
  }

  return {
    normalizedSymbol,
    coin
  };
};

const getMockCoinHistoryEntries = (symbol: string) => {
  const historyEntries = getMockCoinHistory(symbol);

  if (!historyEntries) {
    return throwCoinsError(404, "Coin not found");
  }

  return historyEntries;
};

const getHistoryPriceStats = (prices: number[]) => {
  if (prices.length === 0) {
    return {
      minPrice7d: null,
      maxPrice7d: null,
      avgPrice7d: null
    };
  }

  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  return {
    minPrice7d: Math.min(...prices),
    maxPrice7d: Math.max(...prices),
    avgPrice7d: averagePrice
  };
};

const getRecentHistoryWindow = (historyEntries: CoinHistoryResponse["history"]) => {
  const latestEntry = historyEntries[historyEntries.length - 1];

  if (!latestEntry) {
    return [];
  }

  const latestTimestamp = Date.parse(latestEntry.timestamp);

  return historyEntries.filter(
    (entry) => Date.parse(entry.timestamp) >= latestTimestamp - WEEK_IN_MS
  );
};

const createHistoryDateRange = (
  historyEntries: CoinHistoryResponse["history"],
  params?: Pick<CoinHistoryRequestParams, "dateFrom" | "dateTo">
): CoinHistoryDateRange => ({
  from: params?.dateFrom ?? historyEntries[historyEntries.length - 1]?.timestamp ?? null,
  to: params?.dateTo ?? historyEntries[0]?.timestamp ?? null
});

const normalizeHistoryParams = (params?: CoinHistoryRequestParams): CoinHistoryRequestParams => ({
  ...params,
  dateFrom: normalizeHistoryDateParam(params?.dateFrom),
  dateTo: normalizeHistoryDateParam(params?.dateTo)
});

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
  async getCoinDetails(symbol: string) {
    const user = getCurrentMockUser();
    const { normalizedSymbol, coin } = getMockCatalogCoin(symbol);
    const historyEntries = getMockCoinHistoryEntries(normalizedSymbol);
    const latestEntry = historyEntries[historyEntries.length - 1];

    if (!latestEntry) {
      return throwCoinsError(404, "Coin data not found");
    }

    const recentHistory = getRecentHistoryWindow(historyEntries);
    const priceStats = getHistoryPriceStats(recentHistory.map((entry) => entry.priceUsd));

    return {
      symbol: normalizedSymbol,
      name: coin.name,
      priceUsd: latestEntry.priceUsd,
      change24hPercent: latestEntry.change24hPercent,
      marketCapUsd: latestEntry.marketCapUsd,
      volume24hUsd: latestEntry.volume24hUsd,
      minPrice7d: priceStats.minPrice7d,
      maxPrice7d: priceStats.maxPrice7d,
      avgPrice7d: priceStats.avgPrice7d,
      isFavorite: user.favorites.includes(normalizedSymbol),
      lastUpdatedAt: latestEntry.timestamp
    };
  },
  async getCoinHistory(
    symbol: string,
    params?: CoinHistoryRequestParams
  ): Promise<CoinHistoryResponse> {
    getCurrentMockUser();

    const { normalizedSymbol } = getMockCatalogCoin(symbol);
    const normalizedParams = normalizeHistoryParams(params);
    const historyEntries = getMockCoinHistoryEntries(normalizedSymbol);
    const filteredHistory = historyEntries.filter((entry) =>
      matchesCoinHistoryFilters(entry, normalizedParams)
    );
    const sortedHistory = sortCoinHistoryByRequestParams(filteredHistory, normalizedParams);
    const pagedHistory = paginateCoins(sortedHistory, {
      pageSize: normalizedParams.pageSize,
      pageNo: normalizedParams.pageNo,
      defaultPageSize: DEFAULT_HISTORY_PAGE_SIZE
    });

    return {
      symbol: normalizedSymbol,
      history: pagedHistory.coins,
      totalCount: sortedHistory.length,
      dateRange: createHistoryDateRange(pagedHistory.coins, normalizedParams)
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
      if (user.favorites.includes(normalizedSymbol)) {
        return throwCoinsError(400, "Coin already in favorites");
      }

      return {
        ...user,
        favorites: [...user.favorites, normalizedSymbol]
      };
    }, symbol);

    return createMutationResponse("Coin added to favorites");
  },
  async removeFavorite(symbol: string) {
    updateCurrentMockUser((user, normalizedSymbol) => {
      if (!user.favorites.includes(normalizedSymbol)) {
        return throwCoinsError(400, "Coin is not in favorites");
      }

      return {
        ...user,
        favorites: user.favorites.filter((favoriteSymbol) => favoriteSymbol !== normalizedSymbol)
      };
    }, symbol);

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
