import type { CoinHistoryEntry } from "@/types/coins";
import { mockCoinCatalog } from "@/utils/mocks/mock-coin-catalog";

const MOCK_HISTORY_STEP_MS = 12 * 60 * 60 * 1000;
const MOCK_HISTORY_POINTS = 56;
const MOCK_HISTORY_END_AT = Date.parse("2026-04-22T12:00:00.000Z");
const HISTORY_CHANGE_LOOKBACK_STEPS = 2;

const getPriceFractionDigits = (priceUsd: number): number => {
  if (priceUsd >= 1) {
    return 2;
  }

  return 4;
};

const roundNumber = (value: number, fractionDigits = 2): number =>
  Number(value.toFixed(fractionDigits));

const buildCoinSeed = (symbol: string, index: number): number =>
  [...symbol].reduce(
    (seed, character, characterIndex) =>
      seed + character.charCodeAt(0) * (characterIndex + 1),
    index * 37 + 19
  );

const buildHistoryForCoin = (
  coin: (typeof mockCoinCatalog)[number],
  coinIndex: number
): CoinHistoryEntry[] => {
  const latestEntryIndex = MOCK_HISTORY_POINTS - 1;
  const basePriceUsd = coin.priceUsd;
  const baseMarketCapUsd = coin.marketCapUsd;
  const baseVolume24hUsd = coin.volume24hUsd;
  const baseChange24hPercent = coin.change24hPercent;

  if (
    basePriceUsd === null ||
    baseMarketCapUsd === null ||
    baseVolume24hUsd === null ||
    baseChange24hPercent === null
  ) {
    throw new Error(`Mock coin catalog is missing required metrics for ${coin.symbol}`);
  }

  const priceFractionDigits = getPriceFractionDigits(basePriceUsd);
  const seed = buildCoinSeed(coin.symbol, coinIndex);

  const history = Array.from({ length: MOCK_HISTORY_POINTS }, (_, entryIndex) => {
    const relativeIndex = entryIndex - latestEntryIndex;
    const timestamp = new Date(MOCK_HISTORY_END_AT + relativeIndex * MOCK_HISTORY_STEP_MS);
    const priceWave = Math.sin(relativeIndex * 0.55 + seed) - Math.sin(seed);
    const volumeWave = Math.cos(relativeIndex * 0.42 + seed * 0.3) - Math.cos(seed * 0.3);
    const capWave = Math.sin(relativeIndex * 0.33 + seed * 0.2) - Math.sin(seed * 0.2);
    const priceFactor = Math.max(0.35, 1 + priceWave * 0.035 + relativeIndex * 0.0024);
    const volumeFactor = Math.max(0.3, 1 + volumeWave * 0.22 + relativeIndex * 0.003);
    const marketCapFactor = Math.max(0.35, priceFactor * (1 + capWave * 0.015));

    return {
      timestamp: timestamp.toISOString(),
      priceUsd: roundNumber(basePriceUsd * priceFactor, priceFractionDigits),
      marketCapUsd: roundNumber(baseMarketCapUsd * marketCapFactor, 0),
      volume24hUsd: roundNumber(baseVolume24hUsd * volumeFactor, 0),
      change24hPercent: 0
    };
  });

  return history.map((entry, entryIndex, allEntries) => {
    if (entryIndex === latestEntryIndex) {
      return {
        ...entry,
        change24hPercent: baseChange24hPercent
      };
    }

    const compareEntryIndex = Math.max(0, entryIndex - HISTORY_CHANGE_LOOKBACK_STEPS);
    const comparePrice = allEntries[compareEntryIndex]?.priceUsd ?? entry.priceUsd;
    const change24hPercent =
      comparePrice === 0 ? 0 : ((entry.priceUsd - comparePrice) / comparePrice) * 100;

    return {
      ...entry,
      change24hPercent: roundNumber(change24hPercent, 2)
    };
  });
};

export const mockCoinHistoryBySymbol = new Map(
  mockCoinCatalog.map((coin, coinIndex) => [coin.symbol, buildHistoryForCoin(coin, coinIndex)])
);

export const getMockCoinHistory = (symbol: string): CoinHistoryEntry[] | null =>
  mockCoinHistoryBySymbol.get(symbol.toUpperCase()) ?? null;
