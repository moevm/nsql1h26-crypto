import type { StatisticsViewState } from "@/types/mock-view-state";
import { VIEW_STATUS } from "@/types/status";
import { statisticsPresets } from "@/utils/mocks/ui-mocks";

const chartBars = [34, 42, 39, 51, 55, 60, 58, 66, 69, 74, 72, 79];
const chartLabels = ["1 нед", "2 нед", "3 нед", "4 нед"];
const selectedSymbols = ["BTC", "ETH", "SOL"];

export const useStatisticsViewMock = (): StatisticsViewState => {
  return {
    status: VIEW_STATUS.READY,
    chartBars,
    chartLabels,
    selectedSymbols,
    presets: statisticsPresets,
    retry: () => {}
  };
};
