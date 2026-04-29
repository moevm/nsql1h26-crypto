import { useState } from "react";

import { useToastContext } from "@/components/toast-provider";
import { useCoinListData } from "@/hooks/coin-list-route/use-coin-list-data";
import { WATCHLIST_ROUTE_STATE_CONFIG } from "@/hooks/coin-list-route/coin-list-route-config";
import { useSearchableCoinListTemplate } from "@/hooks/coin-list-route/use-searchable-coin-list-template";
import { useAuth } from "@/hooks/use-auth";
import type { UseWatchlistViewResult } from "@/hooks/watchlist-view/watchlist-view-types";
import { coinsService } from "@/services/coins/coins-service";
import type { WatchlistCoin } from "@/types/coins";
import { getApiErrorMessage } from "@/utils/error-message";

const assertSuccessfulResponse = (
  response: { success: boolean; message?: string },
  fallbackMessage: string
): void => {
  if (response.success) {
    return;
  }

  throw new Error(response.message ?? fallbackMessage);
};

export const useWatchlistView = (): UseWatchlistViewResult => {
  const { session, syncSessionUser } = useAuth();
  const { pushToast } = useToastContext();
  const templateState = useSearchableCoinListTemplate({
    routeConfig: WATCHLIST_ROUTE_STATE_CONFIG,
    rangeIdPrefix: "watchlist",
    queryField: {
      id: "watchlist-query",
      name: "query",
      label: "Глобальный поиск",
      placeholder: "Название или тикер..."
    },
    filterHelperText: "Фильтры применяются по кнопке"
  });
  const { routeState } = templateState;
  const [isRefreshPending, setIsRefreshPending] = useState(false);
  const [favoritePendingSymbols, setFavoritePendingSymbols] = useState<string[]>([]);
  const [removePendingSymbols, setRemovePendingSymbols] = useState<string[]>([]);
  const requestPageSize =
    routeState.requestParams.pageSize ?? WATCHLIST_ROUTE_STATE_CONFIG.defaultPageSize;
  const dataState = useCoinListData({
    currentPage: routeState.appliedState.page,
    fallbackErrorMessage: "Не удалось загрузить список монет",
    isRouteReady: routeState.isRouteReady,
    loadPage: coinsService.searchCoins,
    pageSize: requestPageSize,
    requestKey: JSON.stringify(routeState.requestParams),
    requestParams: routeState.requestParams
  });

  const refreshWatchlist = async () => {
    if (isRefreshPending) {
      return;
    }

    setIsRefreshPending(true);

    try {
      const refreshResponse = await coinsService.refreshWatchlist();
      assertSuccessfulResponse(refreshResponse, "Не удалось обновить данные списка");

      await dataState.reload({
        showLoading: false,
        preserveDataOnError: true
      });

      pushToast({
        type: "success",
        message: refreshResponse.message ?? "Данные обновлены"
      });
    } catch (error) {
      pushToast({
        type: "error",
        message: getApiErrorMessage(error, "Не удалось обновить данные списка")
      });
    } finally {
      setIsRefreshPending(false);
    }
  };

  const handleToggleFavorite = async (coin: WatchlistCoin) => {
    if (
      favoritePendingSymbols.includes(coin.symbol) ||
      removePendingSymbols.includes(coin.symbol)
    ) {
      return;
    }

    setFavoritePendingSymbols((currentSymbols) =>
      currentSymbols.includes(coin.symbol)
        ? currentSymbols
        : [...currentSymbols, coin.symbol]
    );

    try {
      const response = coin.isFavorite
        ? await coinsService.removeFavorite(coin.symbol)
        : await coinsService.addFavorite(coin.symbol);

      assertSuccessfulResponse(
        response,
        coin.isFavorite
          ? "Не удалось удалить монету из избранного"
          : "Не удалось добавить монету в избранное"
      );

      dataState.updateCoins((currentCoins) =>
        currentCoins.map((currentCoin) =>
          currentCoin.symbol === coin.symbol
            ? {
                ...currentCoin,
                isFavorite: !currentCoin.isFavorite
              }
            : currentCoin
        )
      );

      if (session) {
        const nextFavorites = coin.isFavorite
          ? session.favorites.filter((favoriteSymbol) => favoriteSymbol !== coin.symbol)
          : [...session.favorites, coin.symbol];

        syncSessionUser({
          ...session,
          watchlist: session.watchlist,
          favorites: nextFavorites
        });
      }

      pushToast({
        type: "success",
        message: coin.isFavorite
          ? `${coin.symbol} удалена из избранного`
          : `${coin.symbol} добавлена в избранное`
      });
    } catch (error) {
      pushToast({
        type: "error",
        message: getApiErrorMessage(
          error,
          coin.isFavorite
            ? "Не удалось удалить монету из избранного"
            : "Не удалось добавить монету в избранное"
        )
      });
    } finally {
      setFavoritePendingSymbols((currentSymbols) =>
        currentSymbols.filter((currentSymbol) => currentSymbol !== coin.symbol)
      );
    }
  };

  const removeFromWatchlist = async (coin: WatchlistCoin) => {
    if (
      removePendingSymbols.includes(coin.symbol) ||
      favoritePendingSymbols.includes(coin.symbol)
    ) {
      return;
    }

    setRemovePendingSymbols((currentSymbols) =>
      currentSymbols.includes(coin.symbol) ? currentSymbols : [...currentSymbols, coin.symbol]
    );

    try {
      const shouldGoToPreviousPage =
        routeState.appliedState.page > 1 && dataState.coins.length <= 1;
      const response = await coinsService.removeFromWatchlist(coin.symbol);

      assertSuccessfulResponse(response, "Не удалось удалить монету из watchlist");

      if (session) {
        syncSessionUser({
          ...session,
          watchlist: session.watchlist.filter((watchlistSymbol) => watchlistSymbol !== coin.symbol),
          favorites: session.favorites.filter(
            (favoriteSymbol) => favoriteSymbol !== coin.symbol
          )
        });
      }

      if (shouldGoToPreviousPage) {
        routeState.setPage(routeState.appliedState.page - 1);

        pushToast({
          type: "success",
          message: `${coin.symbol} удалена из watchlist`
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
          message: `${coin.symbol} удалена из watchlist`
        });
        pushToast({
          type: "error",
          message: "Монета удалена, но список не удалось обновить"
        });

        return;
      }

      pushToast({
        type: "success",
        message: `${coin.symbol} удалена из watchlist`
      });
    } catch (error) {
      pushToast({
        type: "error",
        message: getApiErrorMessage(error, "Не удалось удалить монету из watchlist")
      });
    } finally {
      setRemovePendingSymbols((currentSymbols) =>
        currentSymbols.filter((currentSymbol) => currentSymbol !== coin.symbol)
      );
    }
  };

  const emptyState =
    dataState.totalCount === 0 && !routeState.hasActiveAppliedFilters
      ? {
          title: "Watchlist пока пуст",
          message: "Добавьте монеты",
          actionLabel: "Добавить монету"
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
      title: "Поиск и диапазоны",
      ...templateState.filterPanelProps
    },
    table: {
      sectionLabel: "Таблица монет",
      title: "Watchlist",
      status: dataState.status,
      errorTitle: "Не удалось загрузить список",
      errorMessage: dataState.errorMessage,
      onRetry: () => {
        void dataState.reload();
      },
      coins: dataState.coins,
      totalLabel: dataState.totalLabel,
      getCoinHref: (coin: WatchlistCoin) =>
        `/app/coins/${encodeURIComponent(coin.symbol)}?from=watchlist`,
      onToggleFavorite: async (coin: WatchlistCoin) => {
        await handleToggleFavorite(coin);
      },
      getFavoriteActionLabel: (coin: WatchlistCoin) =>
        coin.isFavorite ? "Убрать из избранного" : "Добавить в избранное",
      isFavoriteActionPending: (coin: WatchlistCoin) =>
        favoritePendingSymbols.includes(coin.symbol) || removePendingSymbols.includes(coin.symbol),
      actions: [
        {
          key: "remove",
          label: "Удалить",
          tone: "danger",
          onClick: (coin: WatchlistCoin) => {
            void removeFromWatchlist(coin);
          },
          getAriaLabel: (coin: WatchlistCoin) => `Удалить ${coin.symbol} из watchlist`,
          isDisabled: (coin: WatchlistCoin) =>
            favoritePendingSymbols.includes(coin.symbol) ||
            removePendingSymbols.includes(coin.symbol),
          isPending: (coin: WatchlistCoin) => removePendingSymbols.includes(coin.symbol),
          pendingLabel: "..."
        }
      ],
      sort: templateState.tableState.sort,
      onSortChange: templateState.tableState.onSortChange,
      sortableColumns: templateState.tableState.sortableColumns,
      pagination: {
        currentPage: routeState.appliedState.page,
        totalPages: dataState.totalPages,
        canGoPrevious: routeState.appliedState.page > 1,
        canGoNext:
          dataState.hasMore || routeState.appliedState.page < dataState.totalPages,
        onPrevious: () => {
          routeState.setPage(routeState.appliedState.page - 1);
        },
        onNext: () => {
          routeState.setPage(routeState.appliedState.page + 1);
        },
        isPending: dataState.isTablePending || routeState.isRouteTransitionPending
      },
      emptyTitle: emptyState.title,
      emptyMessage: emptyState.message,
      emptyActionLabel: emptyState.actionLabel,
      onEmptyAction: emptyState.onAction
    },
    isRefreshPending,
    refreshWatchlist,
    reloadWatchlist: dataState.reload
  };
};
