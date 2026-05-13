import type { ParsedUrlQuery } from "querystring";

import { normalizeCoinSearchQuery } from "@/services/coins/coins-service-helpers";
import type { CoinTableSortDirection } from "@/types/coins";
import { createQueryString } from "@/utils/query-string";
import {
  parsePositiveIntegerQueryValue,
  readSingleQueryValue
} from "@/utils/route-query";
import {
  areCoinFilterRangesEqual,
  createEmptyCoinFilterRanges,
  getCoinFilterRangesValidationMessage,
  hasActiveCoinFilterRanges,
  parseCoinFilterNumber,
  sanitizeCoinFilterRanges
} from "@/utils/coin-filter-state";

import {
  type CoinListPageModeConfig,
  type CoinListRouteAppliedState,
  type CoinListRouteFiltersDraft,
  type CoinListRouteRequestParams
} from "@/hooks/coin-list-route/coin-list-route-config";

const parseOrder = (
  value: string | undefined,
  fallbackValue: CoinTableSortDirection
): CoinTableSortDirection => {
  if (value === "asc" || value === "desc") {
    return value;
  }

  return fallbackValue;
};

const normalizeRangeQueryValue = (value: string | undefined): string => {
  if (!value) return "";
  return parseCoinFilterNumber(value) !== null ? value.trim() : "";
};

const normalizeDraftQueryForMode = (
  query: string,
  config: CoinListPageModeConfig
): string => {
  if (!config.supportsTextQuery) {
    return "";
  }

  return normalizeCoinSearchQuery(query) ?? "";
};

const normalizeDraftRanges = (draftRanges: CoinListRouteFiltersDraft["ranges"]) =>
  sanitizeCoinFilterRanges(draftRanges);

export const createDefaultCoinListRouteState = (
  config: CoinListPageModeConfig
): CoinListRouteAppliedState => ({
  query: "",
  ranges: createEmptyCoinFilterRanges(),
  onlyFavorites: false,
  sort: config.defaultSort,
  page: 1
});

export const parseCoinListRouteState = (
  routeQuery: ParsedUrlQuery,
  config: CoinListPageModeConfig
): CoinListRouteAppliedState => {
  const sortByValue = readSingleQueryValue(routeQuery.sortBy);
  const orderValue = readSingleQueryValue(routeQuery.order);
  const isAllowedSortKey =
    sortByValue !== undefined &&
    config.allowedSortKeys.includes(sortByValue as (typeof config.allowedSortKeys)[number]);

  return {
    query: config.supportsTextQuery ? normalizeDraftQueryForMode(readSingleQueryValue(routeQuery.query) ?? "", config) : "",
    ranges: {
      price: {
        start: normalizeRangeQueryValue(readSingleQueryValue(routeQuery.priceMin)),
        end: normalizeRangeQueryValue(readSingleQueryValue(routeQuery.priceMax))
      },
      cap: {
        start: normalizeRangeQueryValue(readSingleQueryValue(routeQuery.capMin)),
        end: normalizeRangeQueryValue(readSingleQueryValue(routeQuery.capMax))
      },
      change: {
        start: normalizeRangeQueryValue(readSingleQueryValue(routeQuery.changeMin)),
        end: normalizeRangeQueryValue(readSingleQueryValue(routeQuery.changeMax))
      },
      volume: {
        start: normalizeRangeQueryValue(readSingleQueryValue(routeQuery.volumeMin)),
        end: normalizeRangeQueryValue(readSingleQueryValue(routeQuery.volumeMax))
      }
    },
    onlyFavorites: config.supportsOnlyFavorites === true ? readSingleQueryValue(routeQuery.onlyFavorites) === "true" : false,
    sort: {
      key: isAllowedSortKey
        ? (sortByValue as CoinListRouteAppliedState["sort"]["key"])
        : config.defaultSort.key,
      direction: parseOrder(orderValue, config.defaultSort.direction)
    },
    page: parsePositiveIntegerQueryValue(routeQuery.page, 1)
  };
};

export const areCoinListRouteDraftsEqual = (
  leftDraft: CoinListRouteFiltersDraft,
  rightDraft: CoinListRouteFiltersDraft
): boolean =>
  leftDraft.query === rightDraft.query &&
  leftDraft.onlyFavorites === rightDraft.onlyFavorites &&
  areCoinFilterRangesEqual(leftDraft.ranges, rightDraft.ranges);

export const hasActiveCoinListRouteDraftFilters = (
  draft: CoinListRouteFiltersDraft,
  config: CoinListPageModeConfig
): boolean =>
  normalizeDraftQueryForMode(draft.query, config).length > 0 ||
  hasActiveCoinFilterRanges(draft.ranges) ||
  (config.supportsOnlyFavorites === true && draft.onlyFavorites);

export const getCoinListRouteDraftValidationMessage = (
  draft: CoinListRouteFiltersDraft
): string | null => getCoinFilterRangesValidationMessage(draft.ranges);

export const buildAppliedCoinListRouteDraft = (
  state: CoinListRouteAppliedState
): CoinListRouteFiltersDraft => ({
  query: state.query,
  ranges: state.ranges,
  onlyFavorites: state.onlyFavorites
});

export const buildNextAppliedCoinListRouteStateFromDraft = (
  currentState: CoinListRouteAppliedState,
  draft: CoinListRouteFiltersDraft,
  config: CoinListPageModeConfig
): CoinListRouteAppliedState => ({
  ...currentState,
  query: normalizeDraftQueryForMode(draft.query, config),
  ranges: normalizeDraftRanges(draft.ranges),
  onlyFavorites: config.supportsOnlyFavorites === true ? draft.onlyFavorites : false,
  page: 1
});

export const buildCoinListRouteHref = (
  state: CoinListRouteAppliedState,
  config: CoinListPageModeConfig
): string => {
  const sanitizedState = {
    ...state,
    query: normalizeDraftQueryForMode(state.query, config),
    ranges: normalizeDraftRanges(state.ranges)
  };
  const params = {
    query:
      config.supportsTextQuery && sanitizedState.query.length > 0
        ? sanitizedState.query
        : undefined,
    onlyFavorites:
      config.supportsOnlyFavorites === true && sanitizedState.onlyFavorites ? true : undefined,
    priceMin: sanitizedState.ranges.price.start || undefined,
    priceMax: sanitizedState.ranges.price.end || undefined,
    capMin: sanitizedState.ranges.cap.start || undefined,
    capMax: sanitizedState.ranges.cap.end || undefined,
    changeMin: sanitizedState.ranges.change.start || undefined,
    changeMax: sanitizedState.ranges.change.end || undefined,
    volumeMin: sanitizedState.ranges.volume.start || undefined,
    volumeMax: sanitizedState.ranges.volume.end || undefined,
    sortBy:
      sanitizedState.sort.key !== config.defaultSort.key ? sanitizedState.sort.key : undefined,
    order:
      sanitizedState.sort.direction !== config.defaultSort.direction ||
      sanitizedState.sort.key !== config.defaultSort.key
        ? sanitizedState.sort.direction
        : undefined,
    page: sanitizedState.page > 1 ? sanitizedState.page : undefined
  };

  return `${config.pathname}${createQueryString(params)}`;
};

export const buildCoinListRouteRequestParams = (
  state: CoinListRouteAppliedState,
  config: CoinListPageModeConfig
): CoinListRouteRequestParams => ({
  pageNo: state.page - 1,
  pageSize: config.defaultPageSize,
  sortBy: state.sort.key,
  order: state.sort.direction,
  priceMin: parseCoinFilterNumber(state.ranges.price.start) ?? undefined,
  priceMax: parseCoinFilterNumber(state.ranges.price.end) ?? undefined,
  capMin: parseCoinFilterNumber(state.ranges.cap.start) ?? undefined,
  capMax: parseCoinFilterNumber(state.ranges.cap.end) ?? undefined,
  changeMin: parseCoinFilterNumber(state.ranges.change.start) ?? undefined,
  changeMax: parseCoinFilterNumber(state.ranges.change.end) ?? undefined,
  volumeMin: parseCoinFilterNumber(state.ranges.volume.start) ?? undefined,
  volumeMax: parseCoinFilterNumber(state.ranges.volume.end) ?? undefined,
  query: config.supportsTextQuery && state.query.length > 0 ? state.query : undefined,
  onlyFavorites: config.supportsOnlyFavorites === true && state.onlyFavorites ? true : undefined
});

export const isCoinListRouteStateEqual = (
  leftState: CoinListRouteAppliedState,
  rightState: CoinListRouteAppliedState
): boolean =>
  leftState.query === rightState.query &&
  leftState.onlyFavorites === rightState.onlyFavorites &&
  leftState.page === rightState.page &&
  leftState.sort.key === rightState.sort.key &&
  leftState.sort.direction === rightState.sort.direction &&
  areCoinFilterRangesEqual(leftState.ranges, rightState.ranges);

export const buildCoinListPaginationProps = (
  routeState: {
    appliedState: { page: number };
    isRouteTransitionPending: boolean;
    setPage: (page: number) => void;
  },
  dataState: {
    totalPages: number;
    hasMore: boolean;
    isTablePending: boolean;
  }
) => ({
  currentPage: routeState.appliedState.page,
  totalPages: dataState.totalPages,
  canGoPrevious: routeState.appliedState.page > 1,
  canGoNext: dataState.hasMore || routeState.appliedState.page < dataState.totalPages,
  onPrevious: () => routeState.setPage(routeState.appliedState.page - 1),
  onNext: () => routeState.setPage(routeState.appliedState.page + 1),
  isPending: dataState.isTablePending || routeState.isRouteTransitionPending
});
