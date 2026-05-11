import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/router";

import {
  buildAppliedCoinListRouteDraft,
  buildCoinListRouteHref,
  buildCoinListRouteRequestParams,
  buildNextAppliedCoinListRouteStateFromDraft,
  createDefaultCoinListRouteState,
  getCoinListRouteDraftValidationMessage,
  hasActiveCoinListRouteDraftFilters,
  isCoinListRouteStateEqual,
  parseCoinListRouteState
} from "@/hooks/coin-list-route/coin-list-route-helpers";
import type {
  CoinListPageModeConfig,
  CoinListRouteAppliedState
} from "@/hooks/coin-list-route/coin-list-route-config";
import type { CoinFilterRangeEdge, CoinFilterRangeKey } from "@/types/coins";
import {
  areCoinFilterRangesEqual,
  countActiveCoinFilterRanges,
  createEmptyCoinFilterRanges
} from "@/utils/coin-filter-state";
import { getNextSortState } from "@/utils/coin-table-sorting";

export const useCoinListRouteState = (config: CoinListPageModeConfig) => {
  const router = useRouter();
  const [isRouteTransitionPending, startRouteTransition] = useTransition();
  const [draftQuery, setDraftQuery] = useState("");
  const [draftRanges, setDraftRanges] = useState(createEmptyCoinFilterRanges);
  const appliedState = router.isReady
    ? parseCoinListRouteState(router.query, config)
    : createDefaultCoinListRouteState(config);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    setDraftQuery((currentQuery) =>
      currentQuery !== appliedState.query ? appliedState.query : currentQuery
    );
    setDraftRanges((currentRanges) =>
      !areCoinFilterRangesEqual(currentRanges, appliedState.ranges)
        ? appliedState.ranges
        : currentRanges
    );
  }, [
    appliedState.query,
    appliedState.ranges.cap.end,
    appliedState.ranges.cap.start,
    appliedState.ranges.change.end,
    appliedState.ranges.change.start,
    appliedState.ranges.price.end,
    appliedState.ranges.price.start,
    appliedState.ranges.volume.end,
    appliedState.ranges.volume.start,
    router.isReady
  ]);

  const draftState = {
    query: draftQuery,
    ranges: draftRanges
  };
  const appliedDraftState = buildAppliedCoinListRouteDraft(appliedState);
  const rangeValidationMessage = getCoinListRouteDraftValidationMessage(draftState);
  const hasPendingDraftChanges =
    draftQuery !== appliedState.query ||
    !areCoinFilterRangesEqual(draftRanges, appliedState.ranges);
  const hasActiveDraftFilters = hasActiveCoinListRouteDraftFilters(draftState, config);
  const hasActiveAppliedFilters = hasActiveCoinListRouteDraftFilters(appliedDraftState, config);
  const activeAppliedFilterCount = countActiveCoinFilterRanges(appliedState.ranges);

  const replaceAppliedState = (nextState: CoinListRouteAppliedState) => {
    if (!router.isReady || isCoinListRouteStateEqual(nextState, appliedState)) {
      return;
    }

    const nextHref = buildCoinListRouteHref(nextState, config);

    startRouteTransition(() => {
      void router.replace(nextHref, undefined, {
        shallow: true,
        scroll: false
      });
    });
  };

  return {
    appliedState,
    draftState,
    requestParams: buildCoinListRouteRequestParams(appliedState, config),
    rangeValidationMessage,
    hasPendingDraftChanges,
    hasActiveDraftFilters,
    hasActiveAppliedFilters,
    activeAppliedFilterCount,
    isRouteReady: router.isReady,
    isRouteTransitionPending,
    setDraftQuery: config.supportsTextQuery ? setDraftQuery : undefined,
    setDraftRangeValue: (key: CoinFilterRangeKey, edge: CoinFilterRangeEdge, value: string) => {
      setDraftRanges((currentRanges) => ({
        ...currentRanges,
        [key]: {
          ...currentRanges[key],
          [edge]: value
        }
      }));
    },
    applyDraft: () => {
      if (rangeValidationMessage) {
        return false;
      }

      const nextAppliedState = buildNextAppliedCoinListRouteStateFromDraft(
        appliedState,
        draftState,
        config
      );

      if (draftQuery !== nextAppliedState.query) {
        setDraftQuery(nextAppliedState.query);
      }

      if (!areCoinFilterRangesEqual(draftRanges, nextAppliedState.ranges)) {
        setDraftRanges(nextAppliedState.ranges);
      }

      replaceAppliedState(nextAppliedState);

      return true;
    },
    resetDraft: () => {
      const defaultState = createDefaultCoinListRouteState(config);

      setDraftQuery(defaultState.query);
      setDraftRanges(defaultState.ranges);
      replaceAppliedState(defaultState);
    },
    requestSort: (key: CoinListRouteAppliedState["sort"]["key"]) => {
      const nextSort = getNextSortState(appliedState.sort, key) ?? config.defaultSort;

      replaceAppliedState({
        ...appliedState,
        sort: {
          key: nextSort.key as CoinListRouteAppliedState["sort"]["key"],
          direction: nextSort.direction
        },
        page: 1
      });
    },
    setPage: (page: number) => {
      replaceAppliedState({
        ...appliedState,
        page: Math.max(1, page)
      });
    }
  };
};
