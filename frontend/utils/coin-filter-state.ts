import type {
  CoinFilterRangeKey,
  CoinFilterRangeValue,
  CoinFilterRangesState
} from "@/types/coins";

const COIN_FILTER_RANGE_KEYS: CoinFilterRangeKey[] = ["price", "cap", "change", "volume"];

const COIN_FILTER_RANGE_LABELS: Record<CoinFilterRangeKey, string> = {
  price: "Цена",
  cap: "Капитализация",
  change: "Изменение за 24ч",
  volume: "Объем торгов"
};

export const createEmptyRange = (): CoinFilterRangeValue => ({
  start: "",
  end: ""
});

export const createEmptyCoinFilterRanges = (): CoinFilterRangesState => ({
  price: createEmptyRange(),
  cap: createEmptyRange(),
  change: createEmptyRange(),
  volume: createEmptyRange()
});

export const parseCoinFilterNumber = (value: string): number | null => {
  const normalizedValue = value.trim().replace(",", ".");

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const normalizeCoinFilterNumber = (value: string): string => {
  const parsedValue = parseCoinFilterNumber(value);

  return parsedValue === null ? "" : String(parsedValue);
};

export const sanitizeCoinFilterRanges = (
  ranges: CoinFilterRangesState
): CoinFilterRangesState => ({
  price: {
    start: normalizeCoinFilterNumber(ranges.price.start),
    end: normalizeCoinFilterNumber(ranges.price.end)
  },
  cap: {
    start: normalizeCoinFilterNumber(ranges.cap.start),
    end: normalizeCoinFilterNumber(ranges.cap.end)
  },
  change: {
    start: normalizeCoinFilterNumber(ranges.change.start),
    end: normalizeCoinFilterNumber(ranges.change.end)
  },
  volume: {
    start: normalizeCoinFilterNumber(ranges.volume.start),
    end: normalizeCoinFilterNumber(ranges.volume.end)
  }
});

export const areCoinFilterRangesEqual = (
  leftRanges: CoinFilterRangesState,
  rightRanges: CoinFilterRangesState
): boolean =>
  COIN_FILTER_RANGE_KEYS.every(
    (key) =>
      leftRanges[key].start === rightRanges[key].start &&
      leftRanges[key].end === rightRanges[key].end
  );

export const hasActiveCoinFilterRanges = (ranges: CoinFilterRangesState): boolean =>
  COIN_FILTER_RANGE_KEYS.some(
    (key) => ranges[key].start.trim().length > 0 || ranges[key].end.trim().length > 0
  );

export const getCoinFilterRangesValidationMessage = (
  ranges: CoinFilterRangesState
): string | null => {
  for (const key of COIN_FILTER_RANGE_KEYS) {
    const startValue = parseCoinFilterNumber(ranges[key].start);
    const endValue = parseCoinFilterNumber(ranges[key].end);

    if (startValue !== null && endValue !== null && startValue > endValue) {
      return `Поле «${COIN_FILTER_RANGE_LABELS[key]}»: значение «от» не должно быть больше значения «до»`;
    }
  }

  return null;
};
