const usdPriceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const usdCompactFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const EMPTY_METRIC_LABEL = "—";

export const formatUsdPrice = (value: number | null): string => {
  if (value === null) {
    return EMPTY_METRIC_LABEL;
  }

  return usdPriceFormatter.format(value);
};

export const formatUsdCompact = (value: number | null): string => {
  if (value === null) {
    return EMPTY_METRIC_LABEL;
  }

  return usdCompactFormatter.format(value);
};

export const formatPercentChange = (value: number | null): string => {
  if (value === null) {
    return EMPTY_METRIC_LABEL;
  }

  const sign = value > 0 ? "+" : "";

  return `${sign}${percentFormatter.format(value)}%`;
};

export const getPercentChangeTone = (
  value: number | null
): "positive" | "negative" | "neutral" | "muted" => {
  if (value === null) {
    return "muted";
  }

  if (value > 0) {
    return "positive";
  }

  if (value < 0) {
    return "negative";
  }

  return "neutral";
};
