import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

import { useToastContext } from "@/components/toast-provider";
import {
  getCoinRouteSource,
  getCoinRouteSymbol
} from "@/hooks/coin-details-view/coin-details-route";
import type { UseCoinDetailsViewResult } from "@/hooks/coin-details-view/coin-details-view-types";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/services/http/http-client";
import { coinsService } from "@/services/coins/coins-service";
import type { CoinDetails } from "@/types/coins";
import { getApiErrorMessage } from "@/utils/error-message";

const isNotFoundError = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 404;

const DEFAULT_HEAD_DESCRIPTION = "Страница монеты";

const assertSuccessfulResponse = (
  response: { success: boolean; message?: string },
  fallbackMessage: string
): void => {
  if (response.success) {
    return;
  }

  throw new Error(response.message ?? fallbackMessage);
};

export const useCoinDetailsView = (): UseCoinDetailsViewResult => {
  const router = useRouter();
  const { session, syncSessionUser } = useAuth();
  const { pushToast } = useToastContext();
  const symbol = getCoinRouteSymbol(router.query);
  const source = getCoinRouteSource(router.query);
  const fallbackHref = source === "favorites" ? "/app/favorites" : "/app";
  const [status, setStatus] = useState<UseCoinDetailsViewResult["status"]>("loading");
  const [coinDetails, setCoinDetails] = useState<CoinDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState("Не удалось загрузить монету");
  const [isFavoritePending, setIsFavoritePending] = useState(false);
  const latestRequestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadCoinDetails = useCallback(async () => {
    if (!router.isReady) {
      return;
    }

    if (!symbol) {
      setCoinDetails(null);
      setErrorMessage("Монета не найдена");
      setStatus("notFound");
      return;
    }

    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    setStatus("loading");
    setCoinDetails(null);
    setErrorMessage("Не удалось загрузить монету");

    try {
      const nextCoinDetails = await coinsService.getCoinDetails(symbol);

      if (!isMountedRef.current || latestRequestIdRef.current !== requestId) {
        return;
      }

      setCoinDetails(nextCoinDetails);
      setStatus("ready");
    } catch (error) {
      if (!isMountedRef.current || latestRequestIdRef.current !== requestId) {
        return;
      }

      setCoinDetails(null);
      setErrorMessage(getApiErrorMessage(error, "Не удалось загрузить монету"));
      setStatus(isNotFoundError(error) ? "notFound" : "error");
    }
  }, [router.isReady, symbol]);

  useEffect(() => {
    void loadCoinDetails();
  }, [loadCoinDetails]);

  const goBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();

      return;
    }

    void router.push(fallbackHref);
  }, [fallbackHref, router]);

  const toggleFavorite = useCallback(async () => {
    if (!coinDetails || isFavoritePending) {
      return;
    }

    setIsFavoritePending(true);

    try {
      const response = coinDetails.isFavorite
        ? await coinsService.removeFavorite(coinDetails.symbol)
        : await coinsService.addFavorite(coinDetails.symbol);

      assertSuccessfulResponse(
        response,
        coinDetails.isFavorite
          ? "Не удалось удалить монету из избранного"
          : "Не удалось добавить монету в избранное"
      );

      setCoinDetails((currentCoinDetails) =>
        currentCoinDetails
          ? {
              ...currentCoinDetails,
              isFavorite: !currentCoinDetails.isFavorite
            }
          : currentCoinDetails
      );

      if (session) {
        const nextFavorites = coinDetails.isFavorite
          ? session.favorites.filter((favoriteSymbol) => favoriteSymbol !== coinDetails.symbol)
          : [...session.favorites, coinDetails.symbol];

        syncSessionUser({
          ...session,
          watchlist: session.watchlist,
          favorites: nextFavorites
        });
      }

      pushToast({
        type: "success",
        message: coinDetails.isFavorite
          ? `${coinDetails.symbol} удалена из избранного`
          : `${coinDetails.symbol} добавлена в избранное`
      });
    } catch (error) {
      pushToast({
        type: "error",
        message: getApiErrorMessage(
          error,
          coinDetails.isFavorite
            ? "Не удалось удалить монету из избранного"
            : "Не удалось добавить монету в избранное"
        )
      });
    } finally {
      setIsFavoritePending(false);
    }
  }, [coinDetails, isFavoritePending, pushToast, session, syncSessionUser]);

  const titleSymbol = coinDetails?.symbol ?? symbol;

  return {
    coinDetails,
    errorMessage,
    goBack,
    headDescription: DEFAULT_HEAD_DESCRIPTION,
    headTitle: titleSymbol ? `${titleSymbol} | CryptoWatch` : "Монета | CryptoWatch",
    isFavoritePending,
    pageDescription:
      status === "ready"
        ? "Ключевые метрики монеты, история цены и переключение избранного"
        : "Подготавливаем страницу монеты",
    pageTitle:
      coinDetails?.name && titleSymbol
        ? `${coinDetails.name} (${titleSymbol})`
        : titleSymbol
          ? `Монета ${titleSymbol}`
          : "Монета",
    retry: loadCoinDetails,
    status,
    symbol,
    toggleFavorite
  };
};
