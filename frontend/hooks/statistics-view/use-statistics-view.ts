import { useCallback, useState } from "react";
import { useStatisticsParams } from "@/hooks/statistics-view/use-statistics-params";
import { useStatisticsPresets } from "@/hooks/statistics-view/use-statistics-presets";
import { useStatisticsResults } from "@/hooks/statistics-view/use-statistics-results";
import type { AggregatedDataPoint, StatisticsPreset } from "@/types/statistics";

export type ChartMetric = "avgPrice" | "minPrice" | "maxPrice" | "avgVolume";

const METRIC_KEY = "stats_metric";

const loadSavedMetric = (): ChartMetric => {
  try {
    const raw = sessionStorage.getItem(METRIC_KEY);
    if (raw) return raw as ChartMetric;
  } catch {}
  return "avgPrice";
};

const toShortDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

const toDateInputValue = (timestamp: number): string =>
  new Date(timestamp).toISOString().slice(0, 10);

const computeLabels = (points: AggregatedDataPoint[]): string[] => {
  if (points.length <= 6) return points.map((p) => toShortDate(p.periodStart));
  const step = Math.floor(points.length / 5);
  return points.filter((_, i) => i % step === 0).map((p) => toShortDate(p.periodStart));
};

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
  const firstSymbolPoints = symbols[0] ? (data?.[symbols[0]] ?? []) : [];

  const chartMaxValue = Math.max(...firstSymbolPoints.map((p) => p[chartMetric]), 1);
  const chartBars = firstSymbolPoints.map((p) => Math.round((p[chartMetric] / chartMaxValue) * 100));
  const chartLabels = computeLabels(firstSymbolPoints);

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
    chartBars,
    chartLabels,
    chartMaxValue,
    chartMetric,
    setChartMetric,
    selectedSymbols: symbols,
    build,
    retry,
    loadPreset
  };
};
