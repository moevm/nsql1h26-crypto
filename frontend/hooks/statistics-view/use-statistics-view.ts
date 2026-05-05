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
  const firstSymbolPoints = symbols[0] ? (data?.[symbols[0]] ?? []) : [];

  const chartValues = firstSymbolPoints.map((p) => p[chartMetric]);
  const chartTimestamps = firstSymbolPoints.map((p) => p.periodStart);

  const dateValidationMessage =
    params.timeRangeFrom && params.timeRangeTo && params.timeRangeFrom > params.timeRangeTo
      ? "Поле «Период»: значение «от» не должно быть больше значения «до»"
      : null;

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
    chartValues,
    chartTimestamps,
    chartMetric,
    setChartMetric,
    selectedSymbols: symbols,
    dateValidationMessage,
    build,
    retry,
    loadPreset
  };
};
