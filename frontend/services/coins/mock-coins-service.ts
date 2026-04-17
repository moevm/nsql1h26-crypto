import type { CoinsApi, WatchlistCoin } from "@/types/coins";

const mockWatchlistCoins: WatchlistCoin[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    priceUsd: 67245,
    change24hPercent: 2.4,
    marketCapUsd: 1320000000000,
    volume24hUsd: 28100000000,
    isFavorite: true
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    priceUsd: 3521.4,
    change24hPercent: -1.1,
    marketCapUsd: 423000000000,
    volume24hUsd: 15400000000,
    isFavorite: false
  },
  {
    symbol: "SOL",
    name: "Solana",
    priceUsd: 148.92,
    change24hPercent: 5.7,
    marketCapUsd: 64000000000,
    volume24hUsd: 3200000000,
    isFavorite: true
  },
  {
    symbol: "ADA",
    name: "Cardano",
    priceUsd: 0.62,
    change24hPercent: 0.8,
    marketCapUsd: 22000000000,
    volume24hUsd: 890000000,
    isFavorite: false
  }
];

export const mockCoinsService: CoinsApi = {
  async getWatchlist() {
    return {
      coins: mockWatchlistCoins,
      totalCount: mockWatchlistCoins.length,
      hasMore: false
    };
  },
  async refreshWatchlist() {
    return {
      success: true,
      refreshedCount: mockWatchlistCoins.length
    };
  },
  async addFavorite() {
    return {
      success: true
    };
  },
  async removeFavorite() {
    return {
      success: true
    };
  },
  async removeFromWatchlist() {
    return {
      success: true
    };
  }
};
