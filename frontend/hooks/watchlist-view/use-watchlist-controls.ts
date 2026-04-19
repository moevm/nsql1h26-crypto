import { useState } from "react";

import {
  createEmptyRange,
  getNextSortState,
  getWatchlistRangeValidationMessage,
  hasActiveWatchlistFilters
} from "@/hooks/watchlist-view/watchlist-view-helpers";
import type {
  CoinFilterRangeEdge,
  CoinFilterRangeKey,
  CoinFilterRangesState,
  CoinTableSortKey,
  CoinTableSortState
} from "@/types/coins";

const createEmptyRanges = (): CoinFilterRangesState => ({
  price: createEmptyRange(),
  cap: createEmptyRange(),
  change: createEmptyRange(),
  volume: createEmptyRange()
});

export const useWatchlistControls = () => {
  const [query, setQuery] = useState("");
  const [ranges, setRanges] = useState<CoinFilterRangesState>(createEmptyRanges);
  const [sort, setSort] = useState<CoinTableSortState | null>(null);

  return {
    query,
    setQuery,
    ranges,
    setRangeValue: (key: CoinFilterRangeKey, edge: CoinFilterRangeEdge, value: string) => {
      setRanges((currentRanges) => ({
        ...currentRanges,
        [key]: {
          ...currentRanges[key],
          [edge]: value
        }
      }));
    },
    sort,
    requestSort: (key: CoinTableSortKey) =>
      setSort((currentSort) => getNextSortState(currentSort, key)),
    rangeValidationMessage: getWatchlistRangeValidationMessage(ranges),
    hasActiveFilters: hasActiveWatchlistFilters({
      query,
      ranges,
      sort
    }),
    resetFilters: () => {
      setQuery("");
      setRanges(createEmptyRanges());
      setSort(null);
    }
  };
};
