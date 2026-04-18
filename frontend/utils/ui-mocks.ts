import type { WatchlistCoin } from "@/types/coins";
import type { StatisticsPreset } from "@/types/ui";
import { mockCoinCatalog } from "@/utils/mock-coin-catalog";

const mockCoinsBySymbol = new Map(mockCoinCatalog.map((coin) => [coin.symbol, coin]));

const createMockCoin = (symbol: string, isFavorite: boolean): WatchlistCoin => {
  const coin = mockCoinsBySymbol.get(symbol);

  if (!coin) {
    throw new Error(`Missing mock coin catalog entry for ${symbol}`);
  }

  return {
    ...coin,
    isFavorite
  };
};

export const watchlistCoins: WatchlistCoin[] = [
  createMockCoin("BTC", true),
  createMockCoin("ETH", false),
  createMockCoin("SOL", true),
  createMockCoin("ADA", false)
];

export const favoriteCoins: WatchlistCoin[] = [
  createMockCoin("BTC", true),
  createMockCoin("SOL", true),
  createMockCoin("LINK", true)
];

export const statisticsPresets: StatisticsPreset[] = [
  {
    name: "Пример сохраненной конфигурации",
    symbols: "BTC, ETH, SOL",
    range: "30 дней",
    aggregation: "По дням"
  }
];
