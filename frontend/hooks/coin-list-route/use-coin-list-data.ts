import { useCallback, useEffect, useRef, useState } from "react";

import type { WatchlistCoin } from "@/types/coins";
import { VIEW_STATUS, type ViewStatus } from "@/types/status";
import { getApiErrorMessage } from "@/utils/error-message";

interface ReloadCoinListOptions {
  showLoading?: boolean;
  preserveDataOnError?: boolean;
}

interface CoinListPageResponse {
  coins: WatchlistCoin[];
  totalCount: number;
  hasMore: boolean;
}

interface UseCoinListDataOptions<TRequestParams> {
  currentPage: number;
  fallbackErrorMessage: string;
  isRouteReady: boolean;
  loadPage: (params: TRequestParams) => Promise<CoinListPageResponse>;
  pageSize: number;
  requestKey: string;
  requestParams: TRequestParams;
}

interface UseCoinListDataResult {
  coins: WatchlistCoin[];
  errorMessage: string;
  hasMore: boolean;
  isTablePending: boolean;
  reload: (options?: ReloadCoinListOptions) => Promise<void>;
  status: ViewStatus;
  totalCount: number;
  totalLabel: string;
  totalPages: number;
  updateCoins: (updater: (currentCoins: WatchlistCoin[]) => WatchlistCoin[]) => void;
}

const getCoinListTotalLabel = (
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

export const useCoinListData = <TRequestParams>({
  currentPage,
  fallbackErrorMessage,
  isRouteReady,
  loadPage,
  pageSize,
  requestKey,
  requestParams
}: UseCoinListDataOptions<TRequestParams>): UseCoinListDataResult => {
  const latestRequestIdRef = useRef(0);
  const hasLoadedOnceRef = useRef(false);
  const isMountedRef = useRef(true);
  const requestParamsRef = useRef(requestParams);
  const [coins, setCoins] = useState<WatchlistCoin[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<ViewStatus>(VIEW_STATUS.LOADING);
  const [errorMessage, setErrorMessage] = useState(fallbackErrorMessage);
  const [isTablePending, setIsTablePending] = useState(false);

  useEffect(() => {
    requestParamsRef.current = requestParams;
  }, [requestKey, requestParams]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const applyResponse = useCallback(
    (nextCoins: WatchlistCoin[], nextTotalCount: number, nextHasMore: boolean) => {
      hasLoadedOnceRef.current = true;
      setCoins(nextCoins);
      setTotalCount(nextTotalCount);
      setHasMore(nextHasMore);
      setStatus(nextTotalCount === 0 ? VIEW_STATUS.EMPTY : VIEW_STATUS.READY);
      setErrorMessage(fallbackErrorMessage);
    },
    [fallbackErrorMessage]
  );

  const applyError = useCallback(
    (error: unknown) => {
      setCoins([]);
      setTotalCount(0);
      setHasMore(false);
      setErrorMessage(getApiErrorMessage(error, fallbackErrorMessage));
      setStatus(VIEW_STATUS.ERROR);
    },
    [fallbackErrorMessage]
  );

  const reload = useCallback(
    async (options?: ReloadCoinListOptions) => {
      const requestId = latestRequestIdRef.current + 1;
      latestRequestIdRef.current = requestId;

      const showLoading = options?.showLoading ?? !hasLoadedOnceRef.current;
      const preserveDataOnError = options?.preserveDataOnError ?? false;

      setErrorMessage(fallbackErrorMessage);

      if (showLoading && !hasLoadedOnceRef.current) {
        setStatus(VIEW_STATUS.LOADING);
      } else {
        setIsTablePending(true);
      }

      try {
        const response = await loadPage(requestParamsRef.current);

        if (!isMountedRef.current || latestRequestIdRef.current !== requestId) {
          return;
        }

        applyResponse(response.coins, response.totalCount, response.hasMore);
      } catch (error) {
        if (!isMountedRef.current || latestRequestIdRef.current !== requestId) {
          throw error;
        }

        if (!preserveDataOnError) {
          applyError(error);
        }

        throw error;
      } finally {
        if (!isMountedRef.current || latestRequestIdRef.current !== requestId) {
          return;
        }

        setIsTablePending(false);
      }
    },
    [applyError, applyResponse, fallbackErrorMessage, loadPage]
  );

  useEffect(() => {
    if (!isRouteReady) {
      return;
    }

    void reload({
      showLoading: !hasLoadedOnceRef.current
    });
  }, [isRouteReady, reload, requestKey]);

  return {
    coins,
    errorMessage,
    hasMore,
    isTablePending,
    reload,
    status,
    totalCount,
    totalLabel: getCoinListTotalLabel(currentPage, pageSize, coins.length, totalCount),
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    updateCoins: (updater) => {
      setCoins((currentCoins) => updater(currentCoins));
    }
  };
};
