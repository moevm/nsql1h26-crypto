import type { FavoritesViewState } from "@/types/mock-view-state";
import { VIEW_STATUS } from "@/types/status";
import { favoriteCoins } from "@/utils/mocks/ui-mocks";

const favoritesTotalLabel = "Показано 1-3 из 11 избранных монет";

export const useFavoritesViewMock = (): FavoritesViewState => {
  return {
    status: VIEW_STATUS.READY,
    coins: favoriteCoins,
    totalLabel: favoritesTotalLabel,
    retry: () => {}
  };
};
