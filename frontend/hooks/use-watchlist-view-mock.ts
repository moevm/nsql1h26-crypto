import type { WatchlistViewState } from "@/types/view-state";
import { useDemoErrorState } from "@/hooks/use-demo-error-state";
import { watchlistCoins } from "@/utils/ui-mocks";

const watchlistTotalLabel = "Показано 1-4 из 24 монет";

export const useWatchlistViewMock = (): WatchlistViewState => {
  const hasDemoError = useDemoErrorState();

  return {
    status: hasDemoError ? "error" : "ready",
    coins: watchlistCoins,
    totalLabel: watchlistTotalLabel,
    retry: () => {}
  };
};
