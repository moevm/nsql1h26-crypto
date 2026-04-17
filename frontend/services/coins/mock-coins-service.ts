import { ApiError } from "@/services/http-client";
import type { CoinsApi, CoinsMutationResponse, WatchlistCoin } from "@/types/coins";
import { authStorage } from "@/utils/auth-storage";
import { mockCoinCatalog } from "@/utils/mock-coin-catalog";
import { mockAuthStore, type MockStoredUser } from "@/utils/mock-auth-store";

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

const createMutationResponse = (message?: string): CoinsMutationResponse => ({
  success: true,
  message
});

const saveMockUser = (nextUser: MockStoredUser): MockStoredUser => {
  mockAuthStore.replaceUser(nextUser);
  authStorage.syncUser(nextUser);

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
    return throwCoinsError(404, "Coin not found");
  }

  return saveMockUser(updater(currentUser, normalizedSymbol));
};

export const mockCoinsService: CoinsApi = {
  async getWatchlist() {
    const user = getCurrentMockUser();
    const coins = buildWatchlistCoins(user);

    return {
      coins,
      totalCount: coins.length,
      hasMore: false
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
