import { useCallback, useState } from "react";
import { statisticsService } from "@/services/statistics/statistics-service";
import type { BuildResult, StatisticsParams } from "@/types/statistics";
import { VIEW_STATUS } from "@/types/status";
import type { ViewStatus } from "@/types/status";
import { coinsService } from "@/services/coins/coins-service";

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
  const [errorDetails, setErrorDetails] = useState<{ title: string; message: string } | null>(null);

  const build = useCallback(async (params: StatisticsParams) => {
    setStatus(VIEW_STATUS.LOADING);
    setResult(null);
    setErrorDetails(null);
    sessionStorage.removeItem(RESULT_KEY);

    if (!params.symbols || params.symbols.length === 0) {
      setErrorDetails({
        title: "Не указаны монеты",
        message: "Введите хотя бы один существующий символ (например, BTC) для построения."
      });
      setStatus(VIEW_STATUS.ERROR);
      return;
    }

    try {
      const validations = await Promise.all(
        params.symbols.map(async (symbol) => {
          try {
            await coinsService.getCoinDetails(symbol);
            return { symbol, valid: true } as const;
          } catch {
            return { symbol, valid: false } as const;
          }
        })
      );
      const invalidSymbols = validations.filter((v) => !v.valid).map((v) => v.symbol);
      if (invalidSymbols.length > 0) {
        setErrorDetails({
          title: "Монеты не найдены",
          message: `Следующие тикеры не существуют в системе или недоступны: ${invalidSymbols.join(", ")}`
        });
        setStatus(VIEW_STATUS.ERROR);
        return;
      }
    } catch {
       // Proceed to fetch stats if something goes wrong in validation silently
       // but typically shouldn't fail wrapper
    }

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
    setErrorDetails(null);
    setStatus(VIEW_STATUS.EMPTY);
    sessionStorage.removeItem(RESULT_KEY);
  }, []);

  return { status, result, errorDetails, build, clearResult };
};
