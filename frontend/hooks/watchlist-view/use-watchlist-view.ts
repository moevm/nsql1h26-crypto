import { useEffect, useState } from "react";

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
import type {
  FilterRangeEdge,
  FilterRangeKey,
  FilterRangesState,
  UseWatchlistViewResult
} from "@/hooks/watchlist-view/watchlist-view-types";
import { useToast } from "@/hooks/use-toast";
import { coinsService } from "@/services/coins/coins-service";
import type { CoinTableAction } from "@/types/coin-table";
import type { CoinTableSortKey, CoinTableSortState, WatchlistCoin } from "@/types/coins";
import { VIEW_STATUS, type ViewStatus } from "@/types/status";

const WATCHLIST_PAGE_SIZE = 1000;

const getLoadedStatus = (coinsCount: number, totalCount: number): ViewStatus => {
  return coinsCount === 0 || totalCount === 0 ? VIEW_STATUS.EMPTY : VIEW_STATUS.READY;
};

const createEmptyRanges = (): FilterRangesState => ({
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
  const { pushToast } = useToast();
  const [sourceCoins, setSourceCoins] = useState<WatchlistCoin[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<ViewStatus>(VIEW_STATUS.LOADING);
  const [errorMessage, setErrorMessage] = useState("Не удалось загрузить список монет");
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [ranges, setRanges] = useState<FilterRangesState>(createEmptyRanges);
  const [sort, setSort] = useState<CoinTableSortState | null>(null);
  const [isRefreshPending, setIsRefreshPending] = useState(false);
  const [favoritePendingSymbols, setFavoritePendingSymbols] = useState<string[]>([]);
  const [removePendingSymbols, setRemovePendingSymbols] = useState<string[]>([]);

  useEffect(() => {
    let isCancelled = false;

    const loadWatchlist = async () => {
      setStatus(VIEW_STATUS.LOADING);
      setErrorMessage("Не удалось загрузить список монет");

      try {
        const response = await coinsService.getWatchlist({
          pageNo: 0,
          pageSize: WATCHLIST_PAGE_SIZE
        });

        if (isCancelled) {
          return;
        }

        setSourceCoins(response.coins);
        setTotalCount(response.totalCount);
        setHasMore(response.hasMore);
        setStatus(getLoadedStatus(response.coins.length, response.totalCount));
        setErrorMessage("Не удалось загрузить список монет");
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setSourceCoins([]);
        setTotalCount(0);
        setHasMore(false);
        setErrorMessage(getCoinsErrorMessage(error));
        setStatus(VIEW_STATUS.ERROR);
      }
    };

    void loadWatchlist();

    return () => {
      isCancelled = true;
    };
  }, [reloadKey]);

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

  const syncWatchlistSession = (watchlist: string[], favorites: string[]) => {
    if (!session) {
      return;
    }

    syncSessionUser({
      ...session,
      watchlist,
      favorites
    });
  };

  const resetFilters = () => {
    setQuery("");
    setRanges(createEmptyRanges());
    setSort(null);
  };

  const setRangeValue = (key: FilterRangeKey, edge: FilterRangeEdge, value: string) => {
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

      const watchlistResponse = await coinsService.getWatchlist({
        pageNo: 0,
        pageSize: WATCHLIST_PAGE_SIZE
      });

      setSourceCoins(watchlistResponse.coins);
      setTotalCount(watchlistResponse.totalCount);
      setHasMore(watchlistResponse.hasMore);
      setStatus(getLoadedStatus(watchlistResponse.coins.length, watchlistResponse.totalCount));
      setErrorMessage("Не удалось загрузить список монет");

      pushToast({
        type: "success",
        message:
          refreshResponse.message ??
          `Данные обновлены: ${watchlistResponse.coins.length} монет(ы) в списке`
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

        syncWatchlistSession(session.watchlist, nextFavorites);
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
        syncWatchlistSession(
          session.watchlist.filter((watchlistSymbol) => watchlistSymbol !== coin.symbol),
          session.favorites.filter((favoriteSymbol) => favoriteSymbol !== coin.symbol)
        );
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
    onToggleFavorite: async (coin: WatchlistCoin) => {
      await handleToggleFavorite(coin);
    },
    getFavoriteActionLabel: (coin: WatchlistCoin) =>
      coin.isFavorite ? "Убрать из избранного" : "Добавить в избранное",
    isFavoriteActionPending: (coin: WatchlistCoin) =>
      favoritePendingSymbols.includes(coin.symbol) || removePendingSymbols.includes(coin.symbol),
    actions,
    retry: () => setReloadKey((currentKey) => currentKey + 1)
  };
};
