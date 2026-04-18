import type { WatchlistViewState } from "@/types/view-state";
import { useDemoErrorState } from "@/hooks/use-demo-error-state";
import { VIEW_STATUS } from "@/types/status";
import { watchlistCoins } from "@/utils/ui-mocks";

const watchlistTotalLabel = "Показано 1-4 из 24 монет";

export const useWatchlistViewMock = (): WatchlistViewState => {
  const hasDemoError = useDemoErrorState();

  return {
    status: hasDemoError ? VIEW_STATUS.ERROR : VIEW_STATUS.READY,
    coins: watchlistCoins,
    totalLabel: watchlistTotalLabel,
    retry: () => {}
  };
};
