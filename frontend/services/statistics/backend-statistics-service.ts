import { authorizedHttpClient } from "@/services/http/authorized-http-client";
import type { StatisticsApi } from "@/services/statistics/statistics-api";
import type { BuildResult, StatisticsParams, StatisticsPreset } from "@/types/statistics";

const buildStatisticsQuery = (params: StatisticsParams): string => {
  const q = new URLSearchParams();
  params.symbols.forEach((s) => q.append("symbols", s));
  q.set("aggregation", params.aggregation);
  if (params.timeRangeFrom) q.set("timeRangeFrom", new Date(params.timeRangeFrom).toISOString());
  if (params.timeRangeTo) q.set("timeRangeTo", new Date(params.timeRangeTo).toISOString());
  if (params.minPrice !== null) q.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== null) q.set("maxPrice", String(params.maxPrice));
  if (params.minVolume !== null) q.set("minVolume", String(params.minVolume));
  return `?${q.toString()}`;
};

export const backendStatisticsService: StatisticsApi = {
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
        timeRangeFrom: params.timeRangeFrom ? new Date(params.timeRangeFrom).getTime() : null,
        timeRangeTo: params.timeRangeTo ? new Date(params.timeRangeTo).getTime() : null,
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
