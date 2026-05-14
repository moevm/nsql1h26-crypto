import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  buildCoinDetailsRoutePath,
  getCoinRouteSource,
  getCoinRouteSymbol
} from "@/hooks/coin-details-view/coin-details-route";
import type {
  CoinHistoryChartFilters,
  CoinHistoryFiltersDraft,
  UseCoinHistoryViewResult
} from "@/hooks/coin-details-view/coin-history-view-types";
import { coinsService } from "@/services/coins/coins-service";
import { VIEW_STATUS } from "@/types/status";
import { parseCoinFilterNumber } from "@/utils/coin-filter-state";
import { getApiErrorMessage } from "@/utils/error-message";
import { createQueryString } from "@/utils/query-string";
import {
  parsePositiveIntegerQueryValue,
  readSingleQueryValue
} from "@/utils/route-query";

const DEFAULT_HISTORY_PAGE_SIZE = 10;
const DEFAULT_HISTORY_RANGE_DAYS = 7;
const CHART_PAGE_SIZE = 2000;

interface CoinHistoryRouteAppliedState {
  filters: CoinHistoryFiltersDraft;
  page: number;
}

const formatDateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createDefaultHistoryFiltersDraft = (): CoinHistoryFiltersDraft => {
  const dateTo = new Date();
  const dateFrom = new Date(dateTo);
  dateFrom.setDate(dateTo.getDate() - (DEFAULT_HISTORY_RANGE_DAYS - 1));

  return {
    dateFrom: formatDateInputValue(dateFrom),
    dateTo: formatDateInputValue(dateTo),
    priceMin: "",
    priceMax: "",
    volumeMin: "",
    volumeMax: ""
  };
};

const isValidDateInputValue = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const sanitizeDateInputValue = (value: string | undefined): string => {
  if (!value) {
    return "";
  }

  const normalizedValue = value.trim();

  return isValidDateInputValue(normalizedValue) ? normalizedValue : "";
};

const sanitizeNumericDraftValue = (value: string | undefined): string => {
  if (!value) return "";
  return parseCoinFilterNumber(value) !== null ? value.trim() : "";
};

const areHistoryDraftsEqual = (
  leftDraft: CoinHistoryFiltersDraft,
  rightDraft: CoinHistoryFiltersDraft
): boolean =>
  leftDraft.dateFrom === rightDraft.dateFrom &&
  leftDraft.dateTo === rightDraft.dateTo &&
  leftDraft.priceMin === rightDraft.priceMin &&
  leftDraft.priceMax === rightDraft.priceMax &&
  leftDraft.volumeMin === rightDraft.volumeMin &&
  leftDraft.volumeMax === rightDraft.volumeMax;

const MAX_HISTORY_VALUE = 1e15;

const getHistoryDraftValidationMessage = (
  draft: CoinHistoryFiltersDraft
): string | null => {
  if (draft.dateFrom && draft.dateTo && draft.dateFrom > draft.dateTo) {
    return "Поле «Период»: значение «от» не должно быть больше значения «до»";
  }

  const priceMin = parseCoinFilterNumber(draft.priceMin);
  const priceMax = parseCoinFilterNumber(draft.priceMax);

  if ((priceMin !== null && priceMin < 0) || (priceMax !== null && priceMax < 0)) {
    return "Поле «Цена»: значение не может быть отрицательным";
  }

  if ((priceMin !== null && priceMin > MAX_HISTORY_VALUE) || (priceMax !== null && priceMax > MAX_HISTORY_VALUE)) {
    return "Поле «Цена»: значение слишком велико";
  }

  if (priceMin !== null && priceMax !== null && priceMin > priceMax) {
    return "Поле «Цена»: значение «от» не должно быть больше значения «до»";
  }

  if (draft.volumeMin.trim() && parseCoinFilterNumber(draft.volumeMin) === null) {
    return "Поле «Объем торгов»: неверный формат (пример: 1.5B)";
  }
  if (draft.volumeMax.trim() && parseCoinFilterNumber(draft.volumeMax) === null) {
    return "Поле «Объем торгов»: неверный формат (пример: 1.5B)";
  }

  const volumeMin = parseCoinFilterNumber(draft.volumeMin);
  const volumeMax = parseCoinFilterNumber(draft.volumeMax);

  if ((volumeMin !== null && volumeMin < 0) || (volumeMax !== null && volumeMax < 0)) {
    return "Поле «Объем торгов»: значение не может быть отрицательным";
  }

  if ((volumeMin !== null && volumeMin > MAX_HISTORY_VALUE) || (volumeMax !== null && volumeMax > MAX_HISTORY_VALUE)) {
    return "Поле «Объем торгов»: значение слишком велико";
  }

  if (volumeMin !== null && volumeMax !== null && volumeMin > volumeMax) {
    return "Поле «Объем торгов»: значение «от» не должно быть больше значения «до»";
  }

  return null;
};

const parseHistoryRouteState = (
  routeQuery: ReturnType<typeof useRouter>["query"]
): CoinHistoryRouteAppliedState => {
  const defaultDraft = createDefaultHistoryFiltersDraft();
  const rawDateFrom = sanitizeDateInputValue(readSingleQueryValue(routeQuery.dateFrom));
  const rawDateTo = sanitizeDateInputValue(readSingleQueryValue(routeQuery.dateTo));

  return {
    filters: {
      dateFrom: rawDateFrom || (!rawDateTo ? defaultDraft.dateFrom : ""),
      dateTo: rawDateTo || (!rawDateFrom ? defaultDraft.dateTo : ""),
      priceMin: sanitizeNumericDraftValue(readSingleQueryValue(routeQuery.priceMin)),
      priceMax: sanitizeNumericDraftValue(readSingleQueryValue(routeQuery.priceMax)),
      volumeMin: sanitizeNumericDraftValue(readSingleQueryValue(routeQuery.volumeMin)),
      volumeMax: sanitizeNumericDraftValue(readSingleQueryValue(routeQuery.volumeMax))
    },
    page: parsePositiveIntegerQueryValue(routeQuery.page, 1)
  };
};

const buildHistoryRouteHref = (
  symbol: string,
  source: ReturnType<typeof getCoinRouteSource>,
  state: CoinHistoryRouteAppliedState
): string => {
  const params = {
    from: source ?? undefined,
    dateFrom: state.filters.dateFrom || undefined,
    dateTo: state.filters.dateTo || undefined,
    priceMin: state.filters.priceMin || undefined,
    priceMax: state.filters.priceMax || undefined,
    volumeMin: state.filters.volumeMin || undefined,
    volumeMax: state.filters.volumeMax || undefined,
    page: state.page > 1 ? state.page : undefined
  };

  return `${buildCoinDetailsRoutePath(symbol)}${createQueryString(params)}`;
};

const toDateBoundaryIso = (
  value: string,
  edge: "start" | "end"
): string | undefined => {
  if (!isValidDateInputValue(value)) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date =
    edge === "start"
      ? new Date(year, month - 1, day, 0, 0, 0, 0)
      : new Date(year, month - 1, day, 23, 59, 59, 999);

  return date.toISOString();
};

const buildHistoryRequestParams = (state: CoinHistoryRouteAppliedState) => ({
  dateFrom: state.filters.dateFrom
    ? toDateBoundaryIso(state.filters.dateFrom, "start")
    : undefined,
  dateTo: state.filters.dateTo ? toDateBoundaryIso(state.filters.dateTo, "end") : undefined,
  priceMin: parseCoinFilterNumber(state.filters.priceMin) ?? undefined,
  priceMax: parseCoinFilterNumber(state.filters.priceMax) ?? undefined,
  volumeMin: parseCoinFilterNumber(state.filters.volumeMin) ?? undefined,
  volumeMax: parseCoinFilterNumber(state.filters.volumeMax) ?? undefined,
  pageNo: state.page - 1,
  pageSize: DEFAULT_HISTORY_PAGE_SIZE
});

const buildChartRequestParams = (state: CoinHistoryRouteAppliedState) => ({
  dateFrom: state.filters.dateFrom
    ? toDateBoundaryIso(state.filters.dateFrom, "start")
    : undefined,
  dateTo: state.filters.dateTo ? toDateBoundaryIso(state.filters.dateTo, "end") : undefined,
  pageNo: 0,
  pageSize: CHART_PAGE_SIZE,
  sortBy: "timestamp" as const,
  order: "desc" as const
});

const getHistoryTotalLabel = (
  currentPage: number,
  pageSize: number,
  visibleCount: number,
  totalCount: number
): string => {
  if (totalCount === 0 || visibleCount === 0) {
    return "Показано 0 из 0";
  }

  const start = (currentPage - 1) * pageSize + 1;
  const end = start + visibleCount - 1;

  return `Показано ${start}-${end} из ${totalCount}`;
};

export const useCoinHistoryView = (): UseCoinHistoryViewResult => {
  const router = useRouter();
  const [isRouteTransitionPending, startRouteTransition] = useTransition();
  const symbol = getCoinRouteSymbol(router.query);
  const source = getCoinRouteSource(router.query);
  const defaultDraft = useMemo(createDefaultHistoryFiltersDraft, []);
  const appliedState = router.isReady
    ? parseHistoryRouteState(router.query)
    : {
        filters: defaultDraft,
        page: 1
      };
  const [draftFilters, setDraftFilters] = useState<CoinHistoryFiltersDraft>(defaultDraft);
  const [entries, setEntries] = useState<UseCoinHistoryViewResult["entries"]>([]);
  const [chartEntries, setChartEntries] = useState<UseCoinHistoryViewResult["chartEntries"]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<UseCoinHistoryViewResult["status"]>(VIEW_STATUS.LOADING);
  const [errorMessage, setErrorMessage] = useState("Не удалось загрузить историю");
  const latestTableRequestIdRef = useRef(0);
  const latestChartRequestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    setDraftFilters((currentDraft) =>
      areHistoryDraftsEqual(currentDraft, appliedState.filters)
        ? currentDraft
        : appliedState.filters
    );
  }, [
    appliedState.filters.dateFrom,
    appliedState.filters.dateTo,
    appliedState.filters.priceMin,
    appliedState.filters.priceMax,
    appliedState.filters.volumeMin,
    appliedState.filters.volumeMax,
    router.isReady
  ]);

  useEffect(() => {
    if (!router.isReady || !symbol) {
      return;
    }

    const hasDateFromQuery = Boolean(readSingleQueryValue(router.query.dateFrom));
    const hasDateToQuery = Boolean(readSingleQueryValue(router.query.dateTo));

    if (hasDateFromQuery || hasDateToQuery) {
      return;
    }

    const nextHref = buildHistoryRouteHref(symbol, source, {
      filters: appliedState.filters,
      page: appliedState.page
    });

    startRouteTransition(() => {
      void router.replace(nextHref, undefined, {
        shallow: true,
        scroll: false
      });
    });
  }, [
    appliedState.filters.dateFrom,
    appliedState.filters.dateTo,
    appliedState.page,
    router,
    router.isReady,
    source,
    symbol
  ]);

  const requestParams = useMemo(
    () => buildHistoryRequestParams(appliedState),
    [
      appliedState.filters.dateFrom,
      appliedState.filters.dateTo,
      appliedState.filters.priceMin,
      appliedState.filters.priceMax,
      appliedState.filters.volumeMin,
      appliedState.filters.volumeMax,
      appliedState.page
    ]
  );

  const chartRequestParams = useMemo(
    () => buildChartRequestParams(appliedState),
    [appliedState.filters.dateFrom, appliedState.filters.dateTo]
  );

  const loadTableData = useCallback(async () => {
    if (!router.isReady || !symbol) {
      return;
    }

    const requestId = ++latestTableRequestIdRef.current;

    setStatus(VIEW_STATUS.LOADING);
    setEntries([]);
    setTotalCount(0);
    setErrorMessage("Не удалось загрузить историю");

    try {
      const response = await coinsService.getCoinHistory(symbol, requestParams);

      if (!isMountedRef.current || latestTableRequestIdRef.current !== requestId) {
        return;
      }

      setEntries(response.history);
      setTotalCount(response.totalCount);
      setStatus(response.totalCount === 0 ? VIEW_STATUS.EMPTY : VIEW_STATUS.READY);
    } catch (error) {
      if (!isMountedRef.current || latestTableRequestIdRef.current !== requestId) {
        return;
      }

      setEntries([]);
      setTotalCount(0);
      setErrorMessage(getApiErrorMessage(error, "Не удалось загрузить историю"));
      setStatus(VIEW_STATUS.ERROR);
    }
  }, [requestParams, router.isReady, symbol]);

  const loadChartData = useCallback(async () => {
    if (!router.isReady || !symbol) {
      return;
    }

    const requestId = ++latestChartRequestIdRef.current;

    setChartEntries([]);

    try {
      const response = await coinsService.getCoinHistory(symbol, chartRequestParams);

      if (!isMountedRef.current || latestChartRequestIdRef.current !== requestId) {
        return;
      }

      setChartEntries([...response.history].reverse());
    } catch {
      if (!isMountedRef.current || latestChartRequestIdRef.current !== requestId) {
        return;
      }

      setChartEntries([]);
    }
  }, [chartRequestParams, router.isReady, symbol]);

  const retry = useCallback(async () => {
    await Promise.all([loadTableData(), loadChartData()]);
  }, [loadTableData, loadChartData]);

  useEffect(() => {
    void loadTableData();
  }, [loadTableData]);

  useEffect(() => {
    void loadChartData();
  }, [loadChartData]);

  const replaceAppliedState = useCallback(
    (nextState: CoinHistoryRouteAppliedState) => {
      if (!router.isReady || !symbol) {
        return;
      }

      const nextHref = buildHistoryRouteHref(symbol, source, nextState);

      startRouteTransition(() => {
        void router.replace(nextHref, undefined, {
          shallow: true,
          scroll: false
        });
      });
    },
    [router, source, symbol]
  );

  const validationMessage = getHistoryDraftValidationMessage(draftFilters);
  const hasPendingDraftChanges = !areHistoryDraftsEqual(draftFilters, appliedState.filters);
  const isApplyDisabled =
    !hasPendingDraftChanges || Boolean(validationMessage) || isRouteTransitionPending;
  const isResetDisabled =
    (!hasPendingDraftChanges && areHistoryDraftsEqual(appliedState.filters, defaultDraft)) ||
    isRouteTransitionPending;
  const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_HISTORY_PAGE_SIZE));

  const chartFilters: CoinHistoryChartFilters = {
    priceMin: parseCoinFilterNumber(appliedState.filters.priceMin),
    priceMax: parseCoinFilterNumber(appliedState.filters.priceMax),
    volumeMin: parseCoinFilterNumber(appliedState.filters.volumeMin),
    volumeMax: parseCoinFilterNumber(appliedState.filters.volumeMax)
  };

  return {
    entries,
    chartEntries,
    chartFilters,
    errorMessage,
    filters: {
      draft: draftFilters,
      validationMessage,
      isApplyDisabled,
      isApplyPending: isRouteTransitionPending,
      isResetDisabled,
      onDateFromChange: (value) => {
        setDraftFilters((currentDraft) => ({
          ...currentDraft,
          dateFrom: sanitizeDateInputValue(value)
        }));
      },
      onDateToChange: (value) => {
        setDraftFilters((currentDraft) => ({
          ...currentDraft,
          dateTo: sanitizeDateInputValue(value)
        }));
      },
      onPriceMinChange: (value) => {
        setDraftFilters((currentDraft) => ({
          ...currentDraft,
          priceMin: value
        }));
      },
      onPriceMaxChange: (value) => {
        setDraftFilters((currentDraft) => ({
          ...currentDraft,
          priceMax: value
        }));
      },
      onVolumeMinChange: (value) => {
        setDraftFilters((currentDraft) => ({
          ...currentDraft,
          volumeMin: value
        }));
      },
      onVolumeMaxChange: (value) => {
        setDraftFilters((currentDraft) => ({
          ...currentDraft,
          volumeMax: value
        }));
      },
      onApply: () => {
        if (isApplyDisabled) {
          return;
        }

        replaceAppliedState({
          filters: {
            dateFrom: sanitizeDateInputValue(draftFilters.dateFrom),
            dateTo: sanitizeDateInputValue(draftFilters.dateTo),
            priceMin: sanitizeNumericDraftValue(draftFilters.priceMin),
            priceMax: sanitizeNumericDraftValue(draftFilters.priceMax),
            volumeMin: sanitizeNumericDraftValue(draftFilters.volumeMin),
            volumeMax: sanitizeNumericDraftValue(draftFilters.volumeMax)
          },
          page: 1
        });
      },
      onReset: () => {
        setDraftFilters(defaultDraft);
        replaceAppliedState({
          filters: defaultDraft,
          page: 1
        });
      }
    },
    pagination: {
      currentPage: appliedState.page,
      totalPages,
      canGoPrevious: appliedState.page > 1,
      canGoNext: appliedState.page < totalPages,
      onPrevious: () => {
        replaceAppliedState({
          ...appliedState,
          page: Math.max(1, appliedState.page - 1)
        });
      },
      onNext: () => {
        replaceAppliedState({
          ...appliedState,
          page: Math.min(totalPages, appliedState.page + 1)
        });
      },
      isPending: isRouteTransitionPending
    },
    retry,
    status,
    totalLabel: getHistoryTotalLabel(
      appliedState.page,
      DEFAULT_HISTORY_PAGE_SIZE,
      entries.length,
      totalCount
    )
  };
};
