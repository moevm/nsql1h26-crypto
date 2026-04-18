import type { WatchlistCoin } from "@/types/coins";

type MockCoinCatalogEntry = Omit<WatchlistCoin, "isFavorite">;

export const mockCoinCatalog: MockCoinCatalogEntry[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    priceUsd: 67245,
    change24hPercent: 2.4,
    marketCapUsd: 1320000000000,
    volume24hUsd: 28100000000
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    priceUsd: 3521.4,
    change24hPercent: -1.1,
    marketCapUsd: 423000000000,
    volume24hUsd: 15400000000
  },
  {
    symbol: "SOL",
    name: "Solana",
    priceUsd: 148.92,
    change24hPercent: 5.7,
    marketCapUsd: 64000000000,
    volume24hUsd: 3200000000
  },
  {
    symbol: "ADA",
    name: "Cardano",
    priceUsd: 0.62,
    change24hPercent: 0.8,
    marketCapUsd: 22000000000,
    volume24hUsd: 890000000
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    priceUsd: 18.14,
    change24hPercent: -0.4,
    marketCapUsd: 10900000000,
    volume24hUsd: 410000000
  },
  {
    symbol: "XRP",
    name: "XRP",
    priceUsd: 0.58,
    change24hPercent: 1.9,
    marketCapUsd: 32000000000,
    volume24hUsd: 1700000000
  }
];

export const seedMockUserWatchlist = ["BTC", "ETH", "SOL", "ADA"];

export const seedMockUserFavorites = ["BTC", "SOL"];

export const seedMockAdminWatchlist = ["BTC", "ETH", "LINK", "XRP"];

export const seedMockAdminFavorites = ["ETH", "LINK"];
