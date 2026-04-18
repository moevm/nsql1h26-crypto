import { useEffect, useState } from "react";

import {
  createEmptyRange,
  DEFAULT_WATCHLIST_ERROR_MESSAGE,
  getCoinsErrorMessage,
  getDerivedWatchlistStatus,
  getNextSortState,
  getVisibleCoins,
  getWatchlistEmptyState,
  getWatchlistRangeValidationMessage,
  hasActiveWatchlistFilters
} from "@/hooks/watchlist-view/watchlist-view-helpers";
import type { UseWatchlistViewResult } from "@/hooks/watchlist-view/watchlist-view-types";
import { coinsService } from "@/services/coins";
import type { CoinTableSortKey } from "@/types/coins";
import { VIEW_STATUS } from "@/types/status";
import type { ViewStatus } from "@/types/view-state";

export const useWatchlistView = (): UseWatchlistViewResult => {
  const [sourceCoins, setSourceCoins] = useState<Awaited<ReturnType<typeof coinsService.getWatchlist>>["coins"]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<ViewStatus>(VIEW_STATUS.LOADING);
  const [errorMessage, setErrorMessage] = useState(DEFAULT_WATCHLIST_ERROR_MESSAGE);
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [priceRange, setPriceRange] = useState(createEmptyRange);
  const [capRange, setCapRange] = useState(createEmptyRange);
  const [changeRange, setChangeRange] = useState(createEmptyRange);
  const [volumeRange, setVolumeRange] = useState(createEmptyRange);
  const [sort, setSort] = useState<ReturnType<typeof getNextSortState>>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadWatchlist = async () => {
      setStatus(VIEW_STATUS.LOADING);
      setErrorMessage(DEFAULT_WATCHLIST_ERROR_MESSAGE);

      try {
        const response = await coinsService.getWatchlist();

        if (isCancelled) {
          return;
        }

        setSourceCoins(response.coins);
        setTotalCount(response.totalCount);
        setStatus(
          response.coins.length === 0 || response.totalCount === 0
            ? VIEW_STATUS.EMPTY
            : VIEW_STATUS.READY
        );
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setSourceCoins([]);
        setTotalCount(0);
        setErrorMessage(getCoinsErrorMessage(error));
        setStatus(VIEW_STATUS.ERROR);
      }
    };

    void loadWatchlist();

    return () => {
      isCancelled = true;
    };
  }, [reloadKey]);

  const rangeValidationMessage = getWatchlistRangeValidationMessage({
    priceRange,
    capRange,
    changeRange,
    volumeRange
  });
  const visibleCoins = getVisibleCoins(sourceCoins, {
    query,
    priceRange,
    capRange,
    changeRange,
    volumeRange,
    sort
  });
  const hasActiveFilters = hasActiveWatchlistFilters({
    query,
    priceRange,
    capRange,
    changeRange,
    volumeRange,
    sort
  });

  const resetFilters = () => {
    setQuery("");
    setPriceRange(createEmptyRange());
    setCapRange(createEmptyRange());
    setChangeRange(createEmptyRange());
    setVolumeRange(createEmptyRange());
    setSort(null);
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

  return {
    status: derivedStatus,
    coins: visibleCoins,
    totalLabel: `Показано ${visibleCoins.length} из ${totalCount}`,
    errorMessage,
    emptyState,
    query,
    setQuery,
    priceRange,
    setPriceStart: (value: string) =>
      setPriceRange((currentRange) => ({
        ...currentRange,
        start: value
      })),
    setPriceEnd: (value: string) =>
      setPriceRange((currentRange) => ({
        ...currentRange,
        end: value
      })),
    capRange,
    setCapStart: (value: string) =>
      setCapRange((currentRange) => ({
        ...currentRange,
        start: value
      })),
    setCapEnd: (value: string) =>
      setCapRange((currentRange) => ({
        ...currentRange,
        end: value
      })),
    changeRange,
    setChangeStart: (value: string) =>
      setChangeRange((currentRange) => ({
        ...currentRange,
        start: value
      })),
    setChangeEnd: (value: string) =>
      setChangeRange((currentRange) => ({
        ...currentRange,
        end: value
      })),
    volumeRange,
    setVolumeStart: (value: string) =>
      setVolumeRange((currentRange) => ({
        ...currentRange,
        start: value
      })),
    setVolumeEnd: (value: string) =>
      setVolumeRange((currentRange) => ({
        ...currentRange,
        end: value
      })),
    hasActiveFilters,
    resetFilters,
    sort,
    requestSort,
    retry: () => setReloadKey((currentKey) => currentKey + 1)
  };
};
