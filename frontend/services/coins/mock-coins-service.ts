import { ApiError } from "@/services/http-client";
import type {
  CoinsApi,
  CoinsMutationResponse,
  WatchlistCoin,
  WatchlistRequestParams
} from "@/types/coins";
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

const createMutationResponse = (message?: string): CoinsMutationResponse => ({
  success: true,
  message
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
    return throwCoinsError(404, "Coin not found");
  }

  return saveMockUser(updater(currentUser, normalizedSymbol));
};

export const mockCoinsService: CoinsApi = {
  async getWatchlist(params?: WatchlistRequestParams) {
    const user = getCurrentMockUser();
    const allCoins = buildWatchlistCoins(user);
    const pageSize = params?.pageSize ?? allCoins.length;
    const pageNo = params?.pageNo ?? 0;
    const start = pageNo * pageSize;
    const coins = allCoins.slice(start, start + pageSize);

    return {
      coins,
      totalCount: allCoins.length,
      hasMore: start + coins.length < allCoins.length,
      updatedAt: null
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
