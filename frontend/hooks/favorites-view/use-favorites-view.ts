import { useEffect, useRef, useState } from "react";

import {
  getCoinsErrorMessage,
  getNextSortState,
  getWatchlistRangeValidationMessage,
  hasActiveWatchlistFilters
} from "@/hooks/watchlist-view/watchlist-view-helpers";
import {
  createEmptyFavoritesRanges,
  FAVORITES_FILTER_DEBOUNCE_MS,
  FAVORITES_PAGE_SIZE,
  getFavoritesEmptyState,
  getFavoritesRequestParams,
  getFavoritesTotalLabel,
  matchesFavoritesTextQuery,
  normalizeFavoritesQuery,
  paginateFavoritesCoins
} from "@/hooks/favorites-view/favorites-view-helpers";
import type { UseFavoritesViewResult } from "@/hooks/favorites-view/favorites-view-types";
import { coinsService } from "@/services/coins/coins-service";
import type {
  CoinFilterRangeEdge,
  CoinFilterRangeKey,
  CoinFilterRangesState,
  CoinTableSortKey,
  CoinTableSortState,
  WatchlistCoin
} from "@/types/coins";
import { VIEW_STATUS, type ViewStatus } from "@/types/status";

export const useFavoritesView = (): UseFavoritesViewResult => {
  const latestRequestIdRef = useRef(0);
  const hasLoadedOnceRef = useRef(false);
  const [status, setStatus] = useState<ViewStatus>(VIEW_STATUS.LOADING);
  const [errorMessage, setErrorMessage] = useState("Не удалось загрузить избранное");
  const [query, setQueryState] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [ranges, setRanges] = useState<CoinFilterRangesState>(createEmptyFavoritesRanges);
  const [debouncedRanges, setDebouncedRanges] = useState<CoinFilterRangesState>(
    createEmptyFavoritesRanges
  );
  const [sort, setSort] = useState<CoinTableSortState | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [isPaginationPending, setIsPaginationPending] = useState(false);
  const [fetchedCoins, setFetchedCoins] = useState<WatchlistCoin[]>([]);
  const [fetchedTotalCount, setFetchedTotalCount] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
      setDebouncedRanges(ranges);
    }, FAVORITES_FILTER_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query, ranges]);

  const rangeValidationMessage = getWatchlistRangeValidationMessage(debouncedRanges);
  const normalizedQuery = normalizeFavoritesQuery(debouncedQuery);
  const hasActiveFilters = hasActiveWatchlistFilters({
    query,
    ranges,
    sort
  });
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

  const resetFilters = () => {
    setQueryState("");
    setRanges(createEmptyFavoritesRanges());
    setSort(null);
    setPageNo(0);
  };

  const emptyState = getFavoritesEmptyState({
    totalCount,
    hasActiveFilters,
    rangeValidationMessage,
    resetFilters
  });

  return {
    status: derivedStatus,
    coins: visibleCoins,
    totalLabel: getFavoritesTotalLabel(visibleCoins.length, totalCount, pageNo),
    errorMessage,
    emptyState,
    query,
    setQuery: (value: string) => {
      setQueryState(value);
      setPageNo(0);
    },
    ranges,
    setRangeValue: (key: CoinFilterRangeKey, edge: CoinFilterRangeEdge, value: string) => {
      setRanges((currentRanges) => ({
        ...currentRanges,
        [key]: {
          ...currentRanges[key],
          [edge]: value
        }
      }));
      setPageNo(0);
    },
    hasActiveFilters,
    resetFilters,
    sort,
    requestSort: (key: CoinTableSortKey) => {
      setSort((currentSort) => getNextSortState(currentSort, key));
      setPageNo(0);
    },
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
    isPaginationPending,
    retry: () => {
      setReloadNonce((currentValue) => currentValue + 1);
    }
  };
};
