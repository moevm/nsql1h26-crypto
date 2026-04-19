import { useCallback, useEffect, useState } from "react";

import { useToastContext } from "@/components/toast-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  createEmptyRange,
  getCoinsErrorMessage,
  getDerivedWatchlistStatus,
  getNextSortState,
  getVisibleCoins,
  getWatchlistEmptyState,
  getWatchlistRangeValidationMessage,
  hasActiveWatchlistFilters
} from "@/hooks/watchlist-view/watchlist-view-helpers";
import { coinsService } from "@/services/coins/coins-service";
import type { CoinTableAction } from "@/types/coin-table";
import type {
  CoinFilterRangeEdge,
  CoinFilterRangeKey,
  CoinFilterRangesState,
  CoinTableSortKey,
  CoinTableSortState,
  WatchlistCoin
} from "@/types/coins";
import { VIEW_STATUS, type ViewStatus } from "@/types/status";
import type { UseWatchlistViewResult } from "@/hooks/watchlist-view/watchlist-view-types";

const WATCHLIST_PAGE_SIZE = 1000;

const getLoadedStatus = (coinsCount: number, totalCount: number): ViewStatus => {
  return coinsCount === 0 || totalCount === 0 ? VIEW_STATUS.EMPTY : VIEW_STATUS.READY;
};

const createEmptyRanges = (): CoinFilterRangesState => ({
  price: createEmptyRange(),
  cap: createEmptyRange(),
  change: createEmptyRange(),
  volume: createEmptyRange()
});

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
  const [sourceCoins, setSourceCoins] = useState<WatchlistCoin[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<ViewStatus>(VIEW_STATUS.LOADING);
  const [errorMessage, setErrorMessage] = useState("Не удалось загрузить список монет");
  const [query, setQuery] = useState("");
  const [ranges, setRanges] = useState<CoinFilterRangesState>(createEmptyRanges);
  const [sort, setSort] = useState<CoinTableSortState | null>(null);
  const [isRefreshPending, setIsRefreshPending] = useState(false);
  const [favoritePendingSymbols, setFavoritePendingSymbols] = useState<string[]>([]);
  const [removePendingSymbols, setRemovePendingSymbols] = useState<string[]>([]);

  const applyWatchlistResponse = useCallback(
    (coins: WatchlistCoin[], nextTotalCount: number, nextHasMore: boolean) => {
      setSourceCoins(coins);
      setTotalCount(nextTotalCount);
      setHasMore(nextHasMore);
      setStatus(getLoadedStatus(coins.length, nextTotalCount));
      setErrorMessage("Не удалось загрузить список монет");
    },
    []
  );

  const applyWatchlistError = useCallback((error: unknown) => {
    setSourceCoins([]);
    setTotalCount(0);
    setHasMore(false);
    setErrorMessage(getCoinsErrorMessage(error));
    setStatus(VIEW_STATUS.ERROR);
  }, []);

  const reloadWatchlist = useCallback(
    async (options?: { showLoading?: boolean; preserveDataOnError?: boolean }) => {
      const showLoading = options?.showLoading ?? true;
      const preserveDataOnError = options?.preserveDataOnError ?? false;

      if (showLoading) {
        setStatus(VIEW_STATUS.LOADING);
      }

      setErrorMessage("Не удалось загрузить список монет");

      try {
        const response = await coinsService.getWatchlist({
          pageNo: 0,
          pageSize: WATCHLIST_PAGE_SIZE
        });

        applyWatchlistResponse(response.coins, response.totalCount, response.hasMore);
      } catch (error) {
        if (!preserveDataOnError) {
          applyWatchlistError(error);
        }

        throw error;
      }
    },
    [applyWatchlistError, applyWatchlistResponse]
  );

  useEffect(() => {
    let isCancelled = false;

    const loadInitialWatchlist = async () => {
      try {
        const response = await coinsService.getWatchlist({
          pageNo: 0,
          pageSize: WATCHLIST_PAGE_SIZE
        });

        if (isCancelled) {
          return;
        }

        applyWatchlistResponse(response.coins, response.totalCount, response.hasMore);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        applyWatchlistError(error);
      }
    };

    void loadInitialWatchlist();

    return () => {
      isCancelled = true;
    };
  }, [applyWatchlistError, applyWatchlistResponse]);

  const rangeValidationMessage = getWatchlistRangeValidationMessage(ranges);
  const visibleCoins = getVisibleCoins(sourceCoins, {
    query,
    ranges,
    sort
  });
  const hasActiveFilters = hasActiveWatchlistFilters({
    query,
    ranges,
    sort
  });

  const resetFilters = () => {
    setQuery("");
    setRanges(createEmptyRanges());
    setSort(null);
  };

  const setRangeValue = (
    key: CoinFilterRangeKey,
    edge: CoinFilterRangeEdge,
    value: string
  ) => {
    setRanges((currentRanges) => ({
      ...currentRanges,
      [key]: {
        ...currentRanges[key],
        [edge]: value
      }
    }));
  };

  const refreshWatchlist = async () => {
    if (isRefreshPending) {
      return;
    }

    setIsRefreshPending(true);

    try {
      const refreshResponse = await coinsService.refreshWatchlist();
      assertSuccessfulResponse(refreshResponse, "Не удалось обновить данные списка");

      await reloadWatchlist({
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
        message: getCoinsErrorMessage(error)
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

      setSourceCoins((currentCoins) =>
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
        message: getCoinsErrorMessage(error)
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
      const response = await coinsService.removeFromWatchlist(coin.symbol);

      assertSuccessfulResponse(response, "Не удалось удалить монету из watchlist");

      setSourceCoins((currentCoins) =>
        currentCoins.filter((currentCoin) => currentCoin.symbol !== coin.symbol)
      );
      setTotalCount((currentCount) => Math.max(0, currentCount - 1));

      if (session) {
        syncSessionUser({
          ...session,
          watchlist: session.watchlist.filter((watchlistSymbol) => watchlistSymbol !== coin.symbol),
          favorites: session.favorites.filter(
            (favoriteSymbol) => favoriteSymbol !== coin.symbol
          )
        });
      }

      pushToast({
        type: "success",
        message: `${coin.symbol} удалена из watchlist`
      });
    } catch (error) {
      pushToast({
        type: "error",
        message: getCoinsErrorMessage(error)
      });
    } finally {
      setRemovePendingSymbols((currentSymbols) =>
        currentSymbols.filter((currentSymbol) => currentSymbol !== coin.symbol)
      );
    }
  };

  const requestSort = (key: CoinTableSortKey) =>
    setSort((currentSort) => getNextSortState(currentSort, key));
  const derivedStatus = getDerivedWatchlistStatus({
    status,
    sourceCount: sourceCoins.length,
    totalCount,
    visibleCount: visibleCoins.length,
    rangeValidationMessage
  });
  const emptyState = getWatchlistEmptyState({
    sourceCount: sourceCoins.length,
    totalCount,
    rangeValidationMessage,
    resetFilters
  });
  const actions: CoinTableAction[] = [
    {
      key: "remove",
      label: "Удалить",
      tone: "danger",
      onClick: (coin) => {
        void removeFromWatchlist(coin);
      },
      getAriaLabel: (coin) => `Удалить ${coin.symbol} из watchlist`,
      isDisabled: (coin) =>
        favoritePendingSymbols.includes(coin.symbol) || removePendingSymbols.includes(coin.symbol),
      isPending: (coin) => removePendingSymbols.includes(coin.symbol),
      pendingLabel: "..."
    }
  ];

  return {
    status: derivedStatus,
    coins: visibleCoins,
    totalLabel: hasMore
      ? `Показано ${visibleCoins.length} из ${sourceCoins.length} загруженных монет (всего ${totalCount})`
      : `Показано ${visibleCoins.length} из ${totalCount}`,
    errorMessage,
    emptyState,
    query,
    setQuery,
    ranges,
    setRangeValue,
    hasActiveFilters,
    resetFilters,
    sort,
    requestSort,
    isRefreshPending,
    refreshWatchlist,
    reloadWatchlist,
    onToggleFavorite: async (coin: WatchlistCoin) => {
      await handleToggleFavorite(coin);
    },
    getFavoriteActionLabel: (coin: WatchlistCoin) =>
      coin.isFavorite ? "Убрать из избранного" : "Добавить в избранное",
    isFavoriteActionPending: (coin: WatchlistCoin) =>
      favoritePendingSymbols.includes(coin.symbol) || removePendingSymbols.includes(coin.symbol),
    actions,
    retry: () => {
      void reloadWatchlist();
    }
  };
};
