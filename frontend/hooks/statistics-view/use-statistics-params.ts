import { useEffect, useState } from "react";
import type { StatisticsParams } from "@/types/statistics";

const STORAGE_KEY = "stats_params";

const DEFAULT_PARAMS: StatisticsParams = {
  symbols: [],
  timeRangeFrom: "",
  timeRangeTo: "",
  minPrice: null,
  maxPrice: null,
  minVolume: null,
  aggregation: "days"
};

const loadSaved = (): StatisticsParams => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PARAMS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_PARAMS;
};

export const useStatisticsParams = () => {
  const [symbols, setSymbols] = useState<string[]>(() => loadSaved().symbols);
  const [timeRangeFrom, setTimeRangeFrom] = useState(() => loadSaved().timeRangeFrom);
  const [timeRangeTo, setTimeRangeTo] = useState(() => loadSaved().timeRangeTo);
  const [aggregation, setAggregation] = useState<StatisticsParams["aggregation"]>(() => loadSaved().aggregation);
  const [minPrice, setMinPrice] = useState<number | null>(() => loadSaved().minPrice);
  const [maxPrice, setMaxPrice] = useState<number | null>(() => loadSaved().maxPrice);
  const [minVolume, setMinVolume] = useState<number | null>(() => loadSaved().minVolume);

  const currentParams: StatisticsParams = {
    symbols, timeRangeFrom, timeRangeTo, aggregation, minPrice, maxPrice, minVolume
  };

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(currentParams));
  });

  const reset = () => {
    setSymbols(DEFAULT_PARAMS.symbols);
    setTimeRangeFrom(DEFAULT_PARAMS.timeRangeFrom);
    setTimeRangeTo(DEFAULT_PARAMS.timeRangeTo);
    setAggregation(DEFAULT_PARAMS.aggregation);
    setMinPrice(DEFAULT_PARAMS.minPrice);
    setMaxPrice(DEFAULT_PARAMS.maxPrice);
    setMinVolume(DEFAULT_PARAMS.minVolume);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return {
    currentParams,
    symbols,
    timeRangeFrom,
    timeRangeTo,
    aggregation,
    minPrice,
    maxPrice,
    minVolume,
    setSymbols,
    setTimeRangeFrom,
    setTimeRangeTo,
    setAggregation,
    setMinPrice,
    setMaxPrice,
    setMinVolume,
    reset
  };
};
