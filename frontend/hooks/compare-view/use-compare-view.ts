import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

import type { CompareDatePreset, UseCompareViewResult } from "@/hooks/compare-view/compare-view-types";
import { coinsService } from "@/services/coins/coins-service";
import type { CompareResponse, WatchlistCoin } from "@/types/coins";
import { getApiErrorMessage } from "@/utils/error-message";

const toIso = (d: Date): string => d.toISOString();

const presetDates = (preset: CompareDatePreset): { from: string; to: string } => {
  const to = new Date();
  const from = new Date(to);
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  from.setDate(from.getDate() - days);
  return { from: toIso(from), to: toIso(to) };
};

const defaultFrom = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return toIso(d);
};

const getSymbolFromQuery = (q: unknown): string => {
  if (typeof q === "string") return q.toUpperCase();
  if (Array.isArray(q) && typeof q[0] === "string") return (q[0] as string).toUpperCase();
  return "";
};

export const useCompareView = (): UseCompareViewResult => {
  const router = useRouter();
  const symbol1 = getSymbolFromQuery(router.query.symbol);

  const [extraSymbols, setExtraSymbols] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WatchlistCoin[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [datePreset, setDatePreset] = useState<CompareDatePreset | null>("7d");
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(() => toIso(new Date()));
  const [status, setStatus] = useState<UseCompareViewResult["status"]>("idle");
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [prePopulated, setPrePopulated] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!router.isReady || prePopulated) return;
    const withParam = router.query.with;
    if (withParam) {
      const raw = Array.isArray(withParam) ? withParam[0] : withParam;
      const preSelected = raw
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s && s !== symbol1);
      if (preSelected.length > 0) setExtraSymbols(preSelected);
    }
    setPrePopulated(true);
  }, [router.isReady, prePopulated, router.query.with, symbol1]);

  const onSearchQueryChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      searchTimeoutRef.current = setTimeout(() => {
        setIsSearching(true);
        coinsService
          .searchCoins({ query })
          .then((result) => {
            setSearchResults(result.coins.filter((c) => c.symbol !== symbol1));
          })
          .catch(() => {
            setSearchResults([]);
          })
          .finally(() => {
            setIsSearching(false);
          });
      }, 300);
    },
    [symbol1]
  );

  const onAddSymbol = useCallback((symbol: string) => {
    setExtraSymbols((prev) => (prev.includes(symbol) ? prev : [...prev, symbol]));
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const onRemoveSymbol = useCallback((symbol: string) => {
    setExtraSymbols((prev) => prev.filter((s) => s !== symbol));
  }, []);

  const onDatePresetChange = useCallback((preset: CompareDatePreset) => {
    const { from, to } = presetDates(preset);
    setDatePreset(preset);
    setDateFrom(from);
    setDateTo(to);
  }, []);

  const onDateFromChange = useCallback((date: string) => {
    setDateFrom(date);
    setDatePreset(null);
  }, []);

  const onDateToChange = useCallback((date: string) => {
    setDateTo(date);
    setDatePreset(null);
  }, []);

  const onCompare = useCallback(async () => {
    if (!symbol1 || extraSymbols.length === 0) return;
    setStatus("loading");
    setCompareData(null);
    setErrorMessage("");
    try {
      const data = await coinsService.compareCoins({
        symbols: [symbol1, ...extraSymbols],
        from: dateFrom,
        to: dateTo
      });
      setCompareData(data);
      setStatus("ready");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Не удалось выполнить сравнение"));
      setStatus("error");
    }
  }, [symbol1, extraSymbols, dateFrom, dateTo]);

  const goBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      void router.push("/app");
    }
  }, [router]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const titlePart = extraSymbols.length > 0 ? `${symbol1} vs ${extraSymbols.join(", ")}` : symbol1;

  return {
    symbol1,
    extraSymbols,
    searchQuery,
    searchResults,
    isSearching,
    datePreset,
    dateFrom,
    dateTo,
    status,
    compareData,
    errorMessage,
    canCompare: Boolean(symbol1 && extraSymbols.length > 0),
    headTitle: `Сравнение ${titlePart} | CryptoWatch`,
    pageTitle: `Сравнение: ${titlePart}`,
    onSearchQueryChange,
    onAddSymbol,
    onRemoveSymbol,
    onDatePresetChange,
    onDateFromChange,
    onDateToChange,
    onCompare,
    goBack
  };
};
