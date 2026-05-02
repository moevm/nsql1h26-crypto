import { authorizedHttpClient } from "@/services/http/authorized-http-client";
import type { BuildResult, StatisticsParams, StatisticsPreset } from "@/types/statistics";

export interface StatisticsApi {
  buildStatistics(params: StatisticsParams): Promise<BuildResult>;
  getPresets(): Promise<StatisticsPreset[]>;
  savePreset(
    params: StatisticsParams,
    name: string,
    mode: "create" | "update",
    presetId?: string
  ): Promise<void>;
  deletePreset(presetId: string): Promise<void>;
}

const parseLocalDate = (dateStr: string, endOfDay = false): Date => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);
};

const buildStatisticsQuery = (params: StatisticsParams): string => {
  const q = new URLSearchParams();
  params.symbols.forEach((s) => q.append("symbols", s));
  q.set("aggregation", params.aggregation);
  if (params.timeRangeFrom) q.set("timeRangeFrom", parseLocalDate(params.timeRangeFrom).toISOString());
  if (params.timeRangeTo) q.set("timeRangeTo", parseLocalDate(params.timeRangeTo, true).toISOString());
  if (params.minPrice !== null) q.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== null) q.set("maxPrice", String(params.maxPrice));
  if (params.minVolume !== null) q.set("minVolume", String(params.minVolume));
  return `?${q.toString()}`;
};

export const statisticsService: StatisticsApi = {
  async buildStatistics(params: StatisticsParams): Promise<BuildResult> {
    return authorizedHttpClient.get<BuildResult>(
      `/api/statistics/build${buildStatisticsQuery(params)}`
    );
  },

  async getPresets(): Promise<StatisticsPreset[]> {
    const response = await authorizedHttpClient.get<{ presets: StatisticsPreset[] }>(
      "/api/statistics/presets"
    );
    return response.presets ?? [];
  },

  async savePreset(
    params: StatisticsParams,
    name: string,
    mode: "create" | "update",
    presetId?: string
  ): Promise<void> {
    await authorizedHttpClient.post<unknown>("/api/statistics/presets", {
      body: {
        name,
        symbols: params.symbols,
        timeRangeFrom: params.timeRangeFrom ? parseLocalDate(params.timeRangeFrom).getTime() : null,
        timeRangeTo: params.timeRangeTo ? parseLocalDate(params.timeRangeTo, true).getTime() : null,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        minVolume: params.minVolume,
        aggregation: params.aggregation,
        mode,
        presetId: presetId ?? null
      }
    });
  },

  async deletePreset(presetId: string): Promise<void> {
    await authorizedHttpClient.delete<unknown>(
      `/api/statistics/presets/${encodeURIComponent(presetId)}`
    );
  }
};
