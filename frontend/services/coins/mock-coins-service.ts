import { ApiError } from "@/services/http/http-client";
import type {
  AddToWatchlistResponse,
  CoinsApi,
  CoinsMutationResponse,
  FavoritesRequestParams,
  FavoritesResponse,
  WatchlistCoin,
  WatchlistRequestParams
} from "@/types/coins";
import { authStorage } from "@/utils/auth-storage";
import { getFavoritesBackendSortKey } from "@/utils/coin-table-sorting";
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

const matchesRange = (
  value: number | null,
  minValue?: number,
  maxValue?: number
): boolean => {
  if (minValue === undefined && maxValue === undefined) {
    return true;
  }

  if (value === null) {
    return false;
  }

  if (minValue !== undefined && value < minValue) {
    return false;
  }

  if (maxValue !== undefined && value > maxValue) {
    return false;
  }

  return true;
};

const matchesFavoritesFilters = (coin: WatchlistCoin, params?: FavoritesRequestParams): boolean => {
  if (!params) {
    return true;
  }

  return (
    matchesRange(coin.priceUsd, params.priceMin, params.priceMax) &&
    matchesRange(coin.marketCapUsd, params.capMin, params.capMax) &&
    matchesRange(coin.change24hPercent, params.changeMin, params.changeMax) &&
    matchesRange(coin.volume24hUsd, params.volumeMin, params.volumeMax)
  );
};

const compareNullableNumbers = (leftValue: number | null, rightValue: number | null): number => {
  if (leftValue === null && rightValue === null) {
    return 0;
  }

  if (leftValue === null) {
    return 1;
  }

  if (rightValue === null) {
    return -1;
  }

  return leftValue - rightValue;
};

const sortFavoriteCoins = (
  coins: WatchlistCoin[],
  params?: FavoritesRequestParams
): WatchlistCoin[] => {
  const backendSortKey = getFavoritesBackendSortKey(params?.sortBy) ?? "marketCap";
  const direction = params?.order ?? "desc";

  const sortedCoins = [...coins].sort((leftCoin, rightCoin) => {
    const comparisonResult =
      backendSortKey === "price"
        ? compareNullableNumbers(leftCoin.priceUsd, rightCoin.priceUsd)
        : backendSortKey === "percentChange24h"
          ? compareNullableNumbers(leftCoin.change24hPercent, rightCoin.change24hPercent)
          : compareNullableNumbers(leftCoin.marketCapUsd, rightCoin.marketCapUsd);

    if (comparisonResult !== 0) {
      return direction === "asc" ? comparisonResult : comparisonResult * -1;
    }

    return leftCoin.symbol.localeCompare(rightCoin.symbol, "en", {
      sensitivity: "base"
    });
  });

  return sortedCoins;
};

const paginateCoins = <TCoin>(
  allCoins: TCoin[],
  params: {
    pageSize?: number;
    pageNo?: number;
    defaultPageSize: number;
  }
) => {
  const pageSize = params.pageSize ?? params.defaultPageSize;
  const pageNo = params.pageNo ?? 0;
  const start = pageNo * pageSize;
  const coins = allCoins.slice(start, start + pageSize);

  return {
    coins,
    pageSize,
    pageNo,
    hasMore: start + coins.length < allCoins.length
  };
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

export const mockCoinsService: CoinsApi = {
  async getWatchlist(params?: WatchlistRequestParams) {
    const user = getCurrentMockUser();
    const allCoins = buildWatchlistCoins(user);
    const pagedResult = paginateCoins(allCoins, {
      pageSize: params?.pageSize,
      pageNo: params?.pageNo,
      defaultPageSize: allCoins.length || 1
    });

    return {
      coins: pagedResult.coins,
      totalCount: allCoins.length,
      hasMore: pagedResult.hasMore,
      updatedAt: null
    };
  },
  async getFavorites(params?: FavoritesRequestParams): Promise<FavoritesResponse> {
    const user = getCurrentMockUser();
    const filteredCoins = buildFavoriteCoins(user).filter((coin) =>
      matchesFavoritesFilters(coin, params)
    );
    const sortedCoins = sortFavoriteCoins(filteredCoins, params);
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
