import { useEffect, useRef, useState } from "react";

import { useToastContext } from "@/components/toast-provider";
import { getCoinsErrorMessage } from "@/hooks/watchlist-view/watchlist-view-helpers";
import { useFavoritesControls } from "@/hooks/favorites-view/use-favorites-controls";
import {
  FAVORITES_PAGE_SIZE,
  getFavoritesEmptyState,
  getFavoritesRequestParams,
  getFavoritesTotalLabel,
  matchesFavoritesTextQuery,
  paginateFavoritesCoins
} from "@/hooks/favorites-view/favorites-view-helpers";
import { useAuth } from "@/hooks/use-auth";
import type { UseFavoritesViewResult } from "@/hooks/favorites-view/favorites-view-types";
import { coinsService } from "@/services/coins/coins-service";
import type { WatchlistCoin } from "@/types/coins";
import { VIEW_STATUS, type ViewStatus } from "@/types/status";

export const useFavoritesView = (): UseFavoritesViewResult => {
  const { session, syncSessionUser } = useAuth();
  const { pushToast } = useToastContext();
  const {
    query,
    setQuery,
    ranges,
    setRangeValue,
    sort,
    requestSort,
    pageNo,
    setPageNo,
    debouncedRanges,
    normalizedQuery,
    rangeValidationMessage,
    hasActiveFilters,
    resetFilters
  } = useFavoritesControls();
  const latestRequestIdRef = useRef(0);
  const hasLoadedOnceRef = useRef(false);
  const [status, setStatus] = useState<ViewStatus>(VIEW_STATUS.LOADING);
  const [errorMessage, setErrorMessage] = useState("Не удалось загрузить избранное");
  const [reloadNonce, setReloadNonce] = useState(0);
  const [isPaginationPending, setIsPaginationPending] = useState(false);
  const [favoritePendingSymbols, setFavoritePendingSymbols] = useState<string[]>([]);
  const [fetchedCoins, setFetchedCoins] = useState<WatchlistCoin[]>([]);
  const [fetchedTotalCount, setFetchedTotalCount] = useState(0);
  const requestParams = getFavoritesRequestParams({
    pageNo,
    sort,
    query: normalizedQuery,
    ranges: debouncedRanges
  });
  const requestPageNo = requestParams.pageNo ?? 0;
  const requestPageSize = requestParams.pageSize ?? FAVORITES_PAGE_SIZE;
  const requestSortBy = requestParams.sortBy;
  const requestOrder = requestParams.order;
  const requestPriceMin = requestParams.priceMin;
  const requestPriceMax = requestParams.priceMax;
  const requestCapMin = requestParams.capMin;
  const requestCapMax = requestParams.capMax;
  const requestChangeMin = requestParams.changeMin;
  const requestChangeMax = requestParams.changeMax;
  const requestVolumeMin = requestParams.volumeMin;
  const requestVolumeMax = requestParams.volumeMax;

  useEffect(() => {
    if (rangeValidationMessage) {
      setStatus(VIEW_STATUS.READY);
      setIsPaginationPending(false);

      return;
    }

    let isCancelled = false;
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    setErrorMessage("Не удалось загрузить избранное");

    if (hasLoadedOnceRef.current) {
      setIsPaginationPending(true);
    } else {
      setStatus(VIEW_STATUS.LOADING);
    }

    const loadFavorites = async () => {
      try {
        const response = await coinsService.getFavorites(requestParams);

        if (isCancelled || latestRequestIdRef.current !== requestId) {
          return;
        }

        hasLoadedOnceRef.current = true;
        setFetchedCoins(response.coins);
        setFetchedTotalCount(response.totalCount);
        setStatus(VIEW_STATUS.READY);
      } catch (error) {
        if (isCancelled || latestRequestIdRef.current !== requestId) {
          return;
        }

        setFetchedCoins([]);
        setFetchedTotalCount(0);
        setErrorMessage(getCoinsErrorMessage(error, "Не удалось загрузить избранное"));
        setStatus(VIEW_STATUS.ERROR);
      } finally {
        if (isCancelled || latestRequestIdRef.current !== requestId) {
          return;
        }

        setIsPaginationPending(false);
      }
    };

    void loadFavorites();

    return () => {
      isCancelled = true;
    };
  }, [
    normalizedQuery,
    rangeValidationMessage,
    reloadNonce,
    requestCapMax,
    requestCapMin,
    requestChangeMax,
    requestChangeMin,
    requestOrder,
    requestPageNo,
    requestPageSize,
    requestPriceMax,
    requestPriceMin,
    requestSortBy,
    requestVolumeMax,
    requestVolumeMin
  ]);

  const hasTextQuery = normalizedQuery.length > 0;
  const filteredCoins = hasTextQuery
    ? fetchedCoins.filter((coin) => matchesFavoritesTextQuery(coin, normalizedQuery))
    : fetchedCoins;
  const visibleCoins = hasTextQuery
    ? paginateFavoritesCoins(filteredCoins, pageNo, FAVORITES_PAGE_SIZE)
    : fetchedCoins;
  const totalCount = hasTextQuery ? filteredCoins.length : fetchedTotalCount;
  const totalPages = Math.max(1, Math.ceil(totalCount / FAVORITES_PAGE_SIZE));
  const derivedStatus =
    status === VIEW_STATUS.ERROR || status === VIEW_STATUS.LOADING
      ? status
      : rangeValidationMessage || totalCount === 0 || visibleCoins.length === 0
        ? VIEW_STATUS.EMPTY
        : VIEW_STATUS.READY;

  const emptyState = getFavoritesEmptyState({
    totalCount,
    hasActiveFilters,
    rangeValidationMessage,
    resetFilters
  });

  const handleRemoveFavorite = async (coin: WatchlistCoin) => {
    if (!coin.isFavorite || favoritePendingSymbols.includes(coin.symbol)) {
      return;
    }

    const shouldGoToPreviousPage = pageNo > 0 && visibleCoins.length <= 1;

    setFavoritePendingSymbols((currentSymbols) =>
      currentSymbols.includes(coin.symbol) ? currentSymbols : [...currentSymbols, coin.symbol]
    );

    try {
      const response = await coinsService.removeFavorite(coin.symbol);

      if (!response.success) {
        throw new Error(response.message ?? "Не удалось удалить монету из избранного");
      }

      setFetchedCoins((currentCoins) =>
        currentCoins.filter((currentCoin) => currentCoin.symbol !== coin.symbol)
      );
      setFetchedTotalCount((currentCount) => Math.max(0, currentCount - 1));

      if (session) {
        syncSessionUser({
          ...session,
          watchlist: session.watchlist,
          favorites: session.favorites.filter((favoriteSymbol) => favoriteSymbol !== coin.symbol)
        });
      }

      if (shouldGoToPreviousPage) {
        setPageNo((currentPageNo) => Math.max(0, currentPageNo - 1));
      }

      setReloadNonce((currentValue) => currentValue + 1);

      pushToast({
        type: "success",
        message: `${coin.symbol} удалена из избранного`
      });
    } catch (error) {
      pushToast({
        type: "error",
        message: getCoinsErrorMessage(error, "Не удалось удалить монету из избранного")
      });
    } finally {
      setFavoritePendingSymbols((currentSymbols) =>
        currentSymbols.filter((currentSymbol) => currentSymbol !== coin.symbol)
      );
    }
  };

  return {
    status: derivedStatus,
    coins: visibleCoins,
    totalLabel: getFavoritesTotalLabel(visibleCoins.length, totalCount, pageNo),
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
    onToggleFavorite: handleRemoveFavorite,
    getFavoriteActionLabel: (coin: WatchlistCoin) =>
      coin.isFavorite ? "Убрать из избранного" : "Добавить в избранное",
    isFavoriteActionPending: (coin: WatchlistCoin) =>
      favoritePendingSymbols.includes(coin.symbol),
    pagination: {
      currentPage: pageNo + 1,
      totalPages,
      canGoPrevious: pageNo > 0,
      canGoNext: pageNo + 1 < totalPages,
      onPrevious: () => {
        setPageNo((currentPageNo) => Math.max(0, currentPageNo - 1));
      },
      onNext: () => {
        setPageNo((currentPageNo) => Math.min(totalPages - 1, currentPageNo + 1));
      },
      isPending: isPaginationPending
    },
    retry: () => {
      setReloadNonce((currentValue) => currentValue + 1);
    }
  };
};
