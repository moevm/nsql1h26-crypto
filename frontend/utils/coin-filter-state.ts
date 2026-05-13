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
  const normalizedValue = value.trim().replace(",", ".").replace(/^\$/, "");

  if (!normalizedValue) {
    return null;
  }

  const match = normalizedValue.match(/^(\d+(?:\.\d+)?)\s*([KkMmBbTt])?$/);
  if (!match) {
    return null;
  }

  const num = parseFloat(match[1]);
  const suffix = match[2]?.toUpperCase();

  if (suffix) {
    const multipliers: Record<string, number> = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 };
    const result = num * (multipliers[suffix] ?? 1);
    return Number.isFinite(result) ? result : null;
  }

  return Number.isFinite(num) ? num : null;
};

const normalizeCoinFilterNumber = (value: string): string => {
  return parseCoinFilterNumber(value) !== null ? value.trim() : "";
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

export const countActiveCoinFilterRanges = (ranges: CoinFilterRangesState): number =>
  COIN_FILTER_RANGE_KEYS.reduce(
    (count, key) =>
      ranges[key].start.trim().length > 0 || ranges[key].end.trim().length > 0
        ? count + 1
        : count,
    0
  );

export const hasActiveCoinFilterRanges = (ranges: CoinFilterRangesState): boolean =>
  countActiveCoinFilterRanges(ranges) > 0;

const NON_NEGATIVE_FILTER_KEYS: ReadonlySet<CoinFilterRangeKey> = new Set(["price", "cap", "volume"]);
const MAX_FILTER_VALUE = 1e15;

export const getCoinFilterRangesValidationMessage = (
  ranges: CoinFilterRangesState
): string | null => {
  for (const key of COIN_FILTER_RANGE_KEYS) {
    const rawStart = ranges[key].start.trim();
    const rawEnd = ranges[key].end.trim();

    if (rawStart && parseCoinFilterNumber(rawStart) === null) {
      return `Поле «${COIN_FILTER_RANGE_LABELS[key]}»: неверный формат (пример: 1.5B)`;
    }
    if (rawEnd && parseCoinFilterNumber(rawEnd) === null) {
      return `Поле «${COIN_FILTER_RANGE_LABELS[key]}»: неверный формат (пример: 1.5B)`;
    }

    const startValue = parseCoinFilterNumber(ranges[key].start);
    const endValue = parseCoinFilterNumber(ranges[key].end);

    if (NON_NEGATIVE_FILTER_KEYS.has(key)) {
      if ((startValue !== null && startValue < 0) || (endValue !== null && endValue < 0)) {
        return `Поле «${COIN_FILTER_RANGE_LABELS[key]}»: значение не может быть отрицательным`;
      }
    }

    if ((startValue !== null && startValue > MAX_FILTER_VALUE) || (endValue !== null && endValue > MAX_FILTER_VALUE)) {
      return `Поле «${COIN_FILTER_RANGE_LABELS[key]}»: значение слишком велико`;
    }

    if (startValue !== null && endValue !== null && startValue > endValue) {
      return `Поле «${COIN_FILTER_RANGE_LABELS[key]}»: значение «от» не должно быть больше значения «до»`;
    }
  }

  return null;
};
