import { useEffect, useState } from "react";

import {
  getNextSortState,
  getWatchlistRangeValidationMessage,
  hasActiveWatchlistFilters
} from "@/hooks/watchlist-view/watchlist-view-helpers";
import {
  createEmptyFavoritesRanges,
  FAVORITES_FILTER_DEBOUNCE_MS,
  normalizeFavoritesQuery
} from "@/hooks/favorites-view/favorites-view-helpers";
import type {
  CoinFilterRangeEdge,
  CoinFilterRangeKey,
  CoinFilterRangesState,
  CoinTableSortKey,
  CoinTableSortState
} from "@/types/coins";

export const useFavoritesControls = () => {
  const [query, setQueryState] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [ranges, setRanges] = useState<CoinFilterRangesState>(createEmptyFavoritesRanges);
  const [debouncedRanges, setDebouncedRanges] = useState<CoinFilterRangesState>(
    createEmptyFavoritesRanges
  );
  const [sort, setSort] = useState<CoinTableSortState | null>(null);
  const [pageNo, setPageNo] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
      setDebouncedRanges(ranges);
    }, FAVORITES_FILTER_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query, ranges]);

  return {
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
    sort,
    requestSort: (key: CoinTableSortKey) => {
      setSort((currentSort) => getNextSortState(currentSort, key));
      setPageNo(0);
    },
    pageNo,
    setPageNo,
    debouncedRanges,
    normalizedQuery: normalizeFavoritesQuery(debouncedQuery),
    rangeValidationMessage: getWatchlistRangeValidationMessage(debouncedRanges),
    hasActiveFilters: hasActiveWatchlistFilters({
      query,
      ranges,
      sort
    }),
    resetFilters: () => {
      setQueryState("");
      setRanges(createEmptyFavoritesRanges());
      setSort(null);
      setPageNo(0);
    }
  };
};
