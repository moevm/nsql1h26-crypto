import { useCallback, useState } from "react";
import { statisticsService } from "@/services/statistics/statistics-service";
import type { BuildResult, StatisticsParams } from "@/types/statistics";
import { VIEW_STATUS } from "@/types/status";
import type { ViewStatus } from "@/types/status";

const RESULT_KEY = "stats_result";

const loadSavedResult = (): { result: BuildResult | null; status: ViewStatus } => {
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as { result: BuildResult; status: ViewStatus };
      return saved;
    }
  } catch {}
  return { result: null, status: VIEW_STATUS.EMPTY };
};

export const useStatisticsResults = () => {
  const saved = loadSavedResult();
  const [status, setStatus] = useState<ViewStatus>(saved.status);
  const [result, setResult] = useState<BuildResult | null>(saved.result);

  const build = useCallback(async (params: StatisticsParams) => {
    setStatus(VIEW_STATUS.LOADING);
    setResult(null);
    sessionStorage.removeItem(RESULT_KEY);

    try {
      const data = await statisticsService.buildStatistics(params);
      const isEmpty = Object.keys(data.data).length === 0;
      const newStatus = isEmpty ? VIEW_STATUS.EMPTY : VIEW_STATUS.READY;
      setResult(data);
      setStatus(newStatus);
      if (!isEmpty) {
        sessionStorage.setItem(RESULT_KEY, JSON.stringify({ result: data, status: newStatus }));
      }
    } catch {
      setStatus(VIEW_STATUS.ERROR);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setStatus(VIEW_STATUS.EMPTY);
    sessionStorage.removeItem(RESULT_KEY);
  }, []);

  return { status, result, build, clearResult };
};
