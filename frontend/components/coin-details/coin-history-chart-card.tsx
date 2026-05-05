import ReactECharts from "echarts-for-react";
import { useMemo } from "react";

import type { CoinHistoryChartFilters } from "@/hooks/coin-details-view/coin-history-view-types";
import type { CoinHistoryEntry } from "@/types/coins";
import { formatUsdCompact, formatUsdPrice } from "@/utils/coin-formatters";
import {
  BRAND,
  FILTERED_OUT,
  GRID,
  MUTED,
  TEXT,
  TOOLTIP_BG,
  TOOLTIP_BORDER,
  defaultDataZoom,
  tickFormatter
} from "@/utils/chart-theme";

interface CoinHistoryChartCardProps {
  entries: CoinHistoryEntry[];
  chartFilters: CoinHistoryChartFilters;
}

const tooltipFormatter = new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" });

const formatPriceTick = (value: number): string =>
  Math.abs(value) >= 1000 ? formatUsdCompact(value) : formatUsdPrice(value);

export const CoinHistoryChartCard = ({ entries, chartFilters }: CoinHistoryChartCardProps) => {
  const derived = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    if (sorted.length === 0) return null;

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const p of sorted) {
      if (p.priceUsd < min) min = p.priceUsd;
      if (p.priceUsd > max) max = p.priceUsd;
    }

    const padding = min === max ? Math.abs(min) * 0.05 : (max - min) * 0.05;
    const prices = sorted.map((p) => p.priceUsd);

    const hasFilters =
      chartFilters.priceMin !== null ||
      chartFilters.priceMax !== null ||
      chartFilters.volumeMin !== null ||
      chartFilters.volumeMax !== null;

    const filteredPrices = hasFilters
      ? sorted.map((entry) => {
          const ok =
            (chartFilters.priceMin === null || entry.priceUsd >= chartFilters.priceMin) &&
            (chartFilters.priceMax === null || entry.priceUsd <= chartFilters.priceMax) &&
            (chartFilters.volumeMin === null || entry.volume24hUsd >= chartFilters.volumeMin) &&
            (chartFilters.volumeMax === null || entry.volume24hUsd <= chartFilters.volumeMax);
          return ok ? entry.priceUsd : null;
        })
      : null;

    const series = hasFilters
      ? [
          {
            type: "line",
            data: prices,
            showSymbol: false,
            lineStyle: { color: FILTERED_OUT, width: 1.5, type: "dashed" },
            itemStyle: { color: FILTERED_OUT },
            z: 1
          },
          {
            type: "line",
            data: filteredPrices,
            connectNulls: false,
            showSymbol: false,
            lineStyle: { color: BRAND, width: 3 },
            itemStyle: { color: BRAND },
            z: 2
          }
        ]
      : [
          {
            type: "line",
            data: prices,
            showSymbol: false,
            lineStyle: { color: BRAND, width: 3 },
            itemStyle: { color: BRAND }
          }
        ];

    const axisLabel = { color: MUTED, fontSize: 12 };

    const option = {
      grid: { top: 8, right: 12, bottom: 52, left: 8, containLabel: true },
      xAxis: {
        type: "category",
        data: sorted.map((p) => p.timestamp),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          ...axisLabel,
          formatter: (value: string) => tickFormatter.format(new Date(value))
        }
      },
      yAxis: {
        type: "value",
        min: min - padding,
        max: max + padding,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { ...axisLabel, formatter: formatPriceTick },
        splitLine: { lineStyle: { color: GRID, type: "dashed" } }
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: TOOLTIP_BG,
        borderColor: TOOLTIP_BORDER,
        borderRadius: 18,
        textStyle: { color: TEXT, fontSize: 13 },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any[]) => {
          const p = params[0];
          if (!p) return "";
          return `${tooltipFormatter.format(new Date(String(p.axisValue)))}<br/><b>${formatUsdPrice(Number(p.value))}</b>`;
        }
      },
      dataZoom: defaultDataZoom,
      series
    };

    return {
      option,
      hasFilters,
      summaryMetrics: [
        { label: "Последняя цена", value: formatUsdPrice(sorted.at(-1)!.priceUsd) },
        { label: "Мин. за период", value: formatUsdPrice(min) },
        { label: "Макс. за период", value: formatUsdPrice(max) }
      ]
    };
  }, [entries, chartFilters.priceMin, chartFilters.priceMax, chartFilters.volumeMin, chartFilters.volumeMax]);

  if (!derived) return null;

  const { option, hasFilters, summaryMetrics } = derived;

  return (
    <section className="cw-surface-soft">
      <div className="flex flex-col gap-4 border-b border-dashed border-border pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="cw-kicker">График цены</p>
          <h3 className="cw-card-title mt-3">Динамика за период</h3>
          {hasFilters && (
            <div className="mt-2 flex gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-px w-4"
                  style={{ borderBottom: `1px dashed ${FILTERED_OUT}` }}
                />
                Вне фильтра
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-0.5 w-4 rounded"
                  style={{ backgroundColor: BRAND }}
                />
                В фильтре
              </span>
            </div>
          )}
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
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
      </div>
    </section>
  );
};
