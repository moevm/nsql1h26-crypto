import { useCallback, useEffect, useState } from "react";
import { statisticsService } from "@/services/statistics/statistics-service";
import type { StatisticsParams, StatisticsPreset } from "@/types/statistics";

export const useStatisticsPresets = () => {
  const [presets, setPresets] = useState<StatisticsPreset[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await statisticsService.getPresets();
      setPresets(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const savePreset = useCallback(
    async (params: StatisticsParams, name: string) => {
      const existing = presets.find((p) => p.name === name);
      await statisticsService.savePreset(
        params,
        name,
        existing ? "update" : "create",
        existing?.id
      );
      await reload();
    },
    [presets, reload]
  );

  const deletePreset = useCallback(
    async (presetId: string) => {
      await statisticsService.deletePreset(presetId);
      await reload();
    },
    [reload]
  );

  return { presets, loading, savePreset, deletePreset, reload };
};
