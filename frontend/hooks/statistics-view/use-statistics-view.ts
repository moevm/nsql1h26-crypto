import { useCallback, useState } from "react";
import { useStatisticsParams } from "@/hooks/statistics-view/use-statistics-params";
import { useStatisticsPresets } from "@/hooks/statistics-view/use-statistics-presets";
import { useStatisticsResults } from "@/hooks/statistics-view/use-statistics-results";
import type { StatisticsPreset } from "@/types/statistics";

export type ChartMetric = "avgPrice" | "minPrice" | "maxPrice" | "avgVolume";

const METRIC_KEY = "stats_metric";

const loadSavedMetric = (): ChartMetric => {
  try {
    const raw = sessionStorage.getItem(METRIC_KEY);
    if (raw) return raw as ChartMetric;
  } catch {}
  return "avgPrice";
};

const toDateInputValue = (timestamp: number): string =>
  new Date(timestamp).toISOString().slice(0, 10);

export const useStatisticsView = () => {
  const params = useStatisticsParams();
  const results = useStatisticsResults();
  const presets = useStatisticsPresets();
  const [chartMetric, setChartMetricState] = useState<ChartMetric>(loadSavedMetric);

  const setChartMetric = useCallback((metric: ChartMetric) => {
    setChartMetricState(metric);
    try { sessionStorage.setItem(METRIC_KEY, metric); } catch {}
  }, []);

     const symbols = params.currentParams.symbols;
     const data = results.result?.data;

     // Use the longest available series to build the timeline
     const bestSymbol = symbols.reduce<string | null>((acc, symbol) => {
       const candidate = data?.[symbol]?.length ?? 0;
       const current = acc ? (data?.[acc]?.length ?? 0) : 0;
       return candidate > current ? symbol : acc;
     }, null);
     const basePoints = bestSymbol ? (data?.[bestSymbol] ?? []) : [];
     const chartTimestamps = basePoints.map((p) => p.periodStart);

      // Get values for all selected symbols
      const chartSeriesData = symbols.map((symbol) => {
        const symbolPoints = data?.[symbol] ?? [];

        // If this symbol has fewer points than the first symbol, pad with null
        const allValues: (number | null)[] = symbolPoints.map((p) => p[chartMetric]);

        if (allValues.length < chartTimestamps.length) {
          // Pad with nulls
          while (allValues.length < chartTimestamps.length) {
            allValues.push(null);
          }
        }

        return allValues;
      });

  const MAX_STATS_VALUE = 1e15;
  const { minPrice, maxPrice, minVolume } = params;

  const validationMessage = (() => {
    if (params.timeRangeFrom && params.timeRangeTo && params.timeRangeFrom > params.timeRangeTo) {
      return "Поле «Период»: значение «от» не должно быть больше значения «до»";
    }
    if ((minPrice !== null && minPrice < 0) || (maxPrice !== null && maxPrice < 0)) {
      return "Поле «Цена»: значение не может быть отрицательным";
    }
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      return "Поле «Цена»: значение «от» не должно быть больше значения «до»";
    }
    if (minVolume !== null && minVolume < 0) {
      return "Поле «Объем торгов»: значение не может быть отрицательным";
    }
    if (
      (minPrice !== null && minPrice > MAX_STATS_VALUE) ||
      (maxPrice !== null && maxPrice > MAX_STATS_VALUE) ||
      (minVolume !== null && minVolume > MAX_STATS_VALUE)
    ) {
      return "Введённое значение слишком велико";
    }
    return null;
  })();

  const build = useCallback(
    () => results.build(params.currentParams),
    [results, params.currentParams]
  );

  const retry = useCallback(
    () => results.build(params.currentParams),
    [results, params.currentParams]
  );

  const loadPreset = useCallback(
    (preset: StatisticsPreset) => {
      params.setSymbols(preset.symbols);
      params.setTimeRangeFrom(toDateInputValue(preset.timeRangeFrom));
      params.setTimeRangeTo(toDateInputValue(preset.timeRangeTo));
      params.setAggregation(preset.aggregation);
      params.setMinPrice(preset.minPrice);
      params.setMaxPrice(preset.maxPrice);
      params.setMinVolume(preset.minVolume);
    },
    [params]
  );

   return {
     params,
     results,
     presets,
     chartSeriesData,
     chartTimestamps,
     chartMetric,
     setChartMetric,
     selectedSymbols: symbols,
     validationMessage,
     build,
     retry,
     loadPreset
   };
};
