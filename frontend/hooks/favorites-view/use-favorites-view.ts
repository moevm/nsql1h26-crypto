import { useState } from "react";

import { useToastContext } from "@/components/toast-provider";
import { useCoinListData } from "@/hooks/coin-list-route/use-coin-list-data";
import { FAVORITES_ROUTE_STATE_CONFIG } from "@/hooks/coin-list-route/coin-list-route-config";
import { buildCoinListPaginationProps } from "@/hooks/coin-list-route/coin-list-route-helpers";
import { useSearchableCoinListTemplate } from "@/hooks/coin-list-route/use-searchable-coin-list-template";
import { useAuth } from "@/hooks/use-auth";
import type { UseFavoritesViewResult } from "@/hooks/favorites-view/favorites-view-types";
import { coinsService } from "@/services/coins/coins-service";
import type { WatchlistCoin } from "@/types/coins";
import { getApiErrorMessage } from "@/utils/error-message";

export const useFavoritesView = (): UseFavoritesViewResult => {
  const { session, syncSessionUser } = useAuth();
  const { pushToast } = useToastContext();
  const templateState = useSearchableCoinListTemplate({
    routeConfig: FAVORITES_ROUTE_STATE_CONFIG,
    rangeIdPrefix: "favorites",
    filterHelperText: "Фильтры применяются по кнопке",
    queryField: {
      id: "favorites-query",
      name: "query",
      label: "Поиск по названию",
      placeholder: "Название или символ..."
    }
  });
  const { routeState } = templateState;
  const [favoritePendingSymbols, setFavoritePendingSymbols] = useState<string[]>([]);
  const requestPageSize =
    routeState.requestParams.pageSize ?? FAVORITES_ROUTE_STATE_CONFIG.defaultPageSize;
  const dataState = useCoinListData({
    currentPage: routeState.appliedState.page,
    fallbackErrorMessage: "Не удалось загрузить избранное",
    isRouteReady: routeState.isRouteReady,
    loadPage: coinsService.getFavorites,
    pageSize: requestPageSize,
    requestKey: JSON.stringify(routeState.requestParams),
    requestParams: routeState.requestParams
  });

  const handleRemoveFavorite = async (coin: WatchlistCoin) => {
    if (!coin.isFavorite || favoritePendingSymbols.includes(coin.symbol)) {
      return;
    }

    const shouldGoToPreviousPage =
      routeState.appliedState.page > 1 && dataState.coins.length <= 1;

    setFavoritePendingSymbols((currentSymbols) =>
      currentSymbols.includes(coin.symbol) ? currentSymbols : [...currentSymbols, coin.symbol]
    );

    try {
      const response = await coinsService.removeFavorite(coin.symbol);

      if (!response.success) {
        throw new Error(response.message ?? "Не удалось удалить монету из избранного");
      }

      if (session) {
        syncSessionUser({
          ...session,
          watchlist: session.watchlist,
          favorites: session.favorites.filter((favoriteSymbol) => favoriteSymbol !== coin.symbol)
        });
      }

      if (shouldGoToPreviousPage) {
        routeState.setPage(routeState.appliedState.page - 1);

        pushToast({
          type: "success",
          message: `${coin.symbol} удалена из избранного`
        });

        return;
      }

      try {
        await dataState.reload({
          showLoading: false,
          preserveDataOnError: true
        });
      } catch {
        pushToast({
          type: "success",
          message: `${coin.symbol} удалена из избранного`
        });
        pushToast({
          type: "error",
          message: "Монета удалена, но список не удалось обновить"
        });

        return;
      }

      pushToast({
        type: "success",
        message: `${coin.symbol} удалена из избранного`
      });
    } catch (error) {
      pushToast({
        type: "error",
        message: getApiErrorMessage(error, "Не удалось удалить монету из избранного")
      });
    } finally {
      setFavoritePendingSymbols((currentSymbols) =>
        currentSymbols.filter((currentSymbol) => currentSymbol !== coin.symbol)
      );
    }
  };

  const emptyState =
    dataState.totalCount === 0 && !routeState.hasActiveAppliedFilters
      ? {
          title: "Избранное пока пусто",
          message: "Добавьте монеты в избранное на странице watchlist"
        }
      : {
          title: "Монеты не найдены",
          message: "Измените фильтры или сбросьте их",
          actionLabel: "Сбросить фильтры",
          onAction: routeState.resetDraft
        };

  return {
    filters: {
      sectionLabel: "Поиск и фильтр",
      title: "Фильтры и диапазоны",
      ...templateState.filterPanelProps
    },
    table: {
      sectionLabel: "Таблица монет",
      title: "Избранное",
      status: dataState.status,
      errorTitle: "Не удалось загрузить избранное",
      errorMessage: dataState.errorMessage,
      onRetry: () => {
        void dataState.reload();
      },
      coins: dataState.coins,
      totalLabel: dataState.totalLabel,
      getCoinHref: (coin: WatchlistCoin) =>
        `/app/coins/${encodeURIComponent(coin.symbol)}?from=favorites`,
      onToggleFavorite: async (coin: WatchlistCoin) => {
        await handleRemoveFavorite(coin);
      },
      getFavoriteActionLabel: (coin: WatchlistCoin) =>
        coin.isFavorite ? "Убрать из избранного" : "Добавить в избранное",
      isFavoriteActionPending: (coin: WatchlistCoin) =>
        favoritePendingSymbols.includes(coin.symbol),
      sort: templateState.tableState.sort,
      onSortChange: templateState.tableState.onSortChange,
      sortableColumns: templateState.tableState.sortableColumns,
      pagination: buildCoinListPaginationProps(routeState, dataState),
      emptyTitle: emptyState.title,
      emptyMessage: emptyState.message,
      emptyActionLabel: emptyState.actionLabel,
      onEmptyAction: emptyState.onAction
    }
  };
};
