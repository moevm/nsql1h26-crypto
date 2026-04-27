export interface StatisticsParams {
  symbols: string[];
  timeRangeFrom: string;
  timeRangeTo: string;
  minPrice: number | null;
  maxPrice: number | null;
  minVolume: number | null;
  aggregation: "hours" | "days" | "weeks";
}

export interface AggregatedDataPoint {
  periodStart: number;
  periodEnd: number;
  avgPrice: number;
  avgVolume: number;
  minPrice: number;
  maxPrice: number;
  recordCount: number;
}

export interface BuildResult {
  data: Record<string, AggregatedDataPoint[]>;
}

export interface StatisticsPreset {
  id: string;
  name: string;
  symbols: string[];
  timeRangeFrom: number;
  timeRangeTo: number;
  minPrice: number | null;
  maxPrice: number | null;
  minVolume: number | null;
  aggregation: "hours" | "days" | "weeks";
  createdAt: number;
  updatedAt: number;
}
