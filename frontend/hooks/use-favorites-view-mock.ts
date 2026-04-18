import type { FavoritesViewState } from "@/types/view-state";
import { useDemoErrorState } from "@/hooks/use-demo-error-state";
import { favoriteCoins } from "@/utils/ui-mocks";

const favoritesTotalLabel = "Показано 1-3 из 11 избранных монет";

export const useFavoritesViewMock = (): FavoritesViewState => {
  const hasDemoError = useDemoErrorState();

  return {
    status: hasDemoError ? "error" : "ready",
    coins: favoriteCoins,
    totalLabel: favoritesTotalLabel,
    retry: () => {}
  };
};
