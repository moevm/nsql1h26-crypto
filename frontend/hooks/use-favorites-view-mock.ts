import type { FavoritesViewState } from "@/types/view-state";
import { useDemoErrorState } from "@/hooks/use-demo-error-state";
import { VIEW_STATUS } from "@/types/status";
import { favoriteCoins } from "@/utils/ui-mocks";

const favoritesTotalLabel = "Показано 1-3 из 11 избранных монет";

export const useFavoritesViewMock = (): FavoritesViewState => {
  const hasDemoError = useDemoErrorState();

  return {
    status: hasDemoError ? VIEW_STATUS.ERROR : VIEW_STATUS.READY,
    coins: favoriteCoins,
    totalLabel: favoritesTotalLabel,
    retry: () => {}
  };
};
