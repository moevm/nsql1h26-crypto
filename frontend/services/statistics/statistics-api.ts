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
