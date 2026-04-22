import { type ReactNode, useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { CoinHistoryEntry } from "@/types/coins";
import { formatUsdCompact, formatUsdPrice } from "@/utils/coin-formatters";

interface CoinHistoryChartCardProps {
  entries: CoinHistoryEntry[];
}

interface CoinHistoryChartPoint {
  timestamp: string;
  priceUsd: number;
}

const chartTickFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short"
});

const chartTooltipFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short"
});

const formatChartPriceTick = (value: number): string => {
  if (Math.abs(value) >= 1000) {
    return formatUsdCompact(value);
  }

  return formatUsdPrice(value);
};

const formatTooltipPrice = (value: unknown): string => {
  const normalizedValue = Array.isArray(value) ? value[0] : value;
  const numericValue =
    typeof normalizedValue === "number"
      ? normalizedValue
      : typeof normalizedValue === "string"
        ? Number(normalizedValue)
        : null;

  return typeof numericValue === "number" && Number.isFinite(numericValue)
    ? formatUsdPrice(numericValue)
    : formatUsdPrice(null);
};

const formatTooltipLabel = (value: ReactNode): string =>
  chartTooltipFormatter.format(new Date(String(value)));

export const CoinHistoryChartCard = ({ entries }: CoinHistoryChartCardProps) => {
  const chartState = useMemo(() => {
    const points = [...entries]
      .sort((leftEntry, rightEntry) => {
        const leftTime = new Date(leftEntry.timestamp).getTime();
        const rightTime = new Date(rightEntry.timestamp).getTime();

        return leftTime - rightTime;
      })
      .map<CoinHistoryChartPoint>((entry) => ({
        timestamp: entry.timestamp,
        priceUsd: entry.priceUsd
      }));

    let minPriceUsd = Number.POSITIVE_INFINITY;
    let maxPriceUsd = Number.NEGATIVE_INFINITY;

    for (const point of points) {
      if (point.priceUsd < minPriceUsd) {
        minPriceUsd = point.priceUsd;
      }

      if (point.priceUsd > maxPriceUsd) {
        maxPriceUsd = point.priceUsd;
      }
    }

    return {
      points,
      latestPriceUsd: points.at(-1)?.priceUsd ?? null,
      minPriceUsd: Number.isFinite(minPriceUsd) ? minPriceUsd : null,
      maxPriceUsd: Number.isFinite(maxPriceUsd) ? maxPriceUsd : null
    };
  }, [entries]);

  if (chartState.points.length === 0) {
    return null;
  }

  const summaryMetrics = [
    {
      label: "Последняя цена",
      value: formatUsdPrice(chartState.latestPriceUsd)
    },
    {
      label: "Мин. на странице",
      value: formatUsdPrice(chartState.minPriceUsd)
    },
    {
      label: "Макс. на странице",
      value: formatUsdPrice(chartState.maxPriceUsd)
    }
  ];

  return (
    <section className="cw-surface-soft">
      <div className="flex flex-col gap-4 border-b border-dashed border-border pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="cw-kicker">График цены</p>
          <h3 className="cw-card-title mt-3">Динамика по текущим записям</h3>
          <p className="mt-2 text-sm text-text-muted">
            График строится по тем же строкам, которые показаны в таблице ниже
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {summaryMetrics.map((metric) => (
            <div key={metric.label} className="cw-card-surface">
              <p className="cw-kicker">{metric.label}</p>
              <p className="cw-table-primary mt-3">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartState.points} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="rgba(209, 213, 219, 0.6)" strokeDasharray="3 6" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="timestamp"
              minTickGap={24}
              tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
              tickFormatter={(value: string) => chartTickFormatter.format(new Date(value))}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
              tickFormatter={(value: number) => formatChartPriceTick(value)}
              tickLine={false}
              width={88}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid var(--border-soft)",
                borderRadius: "18px",
                boxShadow: "var(--shadow-panel)",
                backgroundColor: "rgba(255, 255, 255, 0.96)"
              }}
              cursor={{ stroke: "rgba(124, 58, 237, 0.24)", strokeWidth: 1 }}
              formatter={formatTooltipPrice}
              labelFormatter={formatTooltipLabel}
            />
            <Line
              activeDot={{ r: 5 }}
              dataKey="priceUsd"
              dot={{
                r: 3,
                stroke: "var(--color-brand)",
                strokeWidth: 2,
                fill: "var(--color-surface)"
              }}
              name="Цена"
              stroke="var(--color-brand)"
              strokeWidth={3}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
