import type { ParsedUrlQuery } from "querystring";

import type { CoinRouteSource } from "@/hooks/coin-details-view/coin-details-view-types";
import { readSingleQueryValue } from "@/utils/route-query";

export const getCoinRouteSymbol = (routeQuery: ParsedUrlQuery): string => {
  const value = readSingleQueryValue(routeQuery.symbol);

  if (typeof value === "string" && value.trim()) {
    return value.trim().toUpperCase();
  }

  return "";
};

export const getCoinRouteSource = (routeQuery: ParsedUrlQuery): CoinRouteSource | null => {
  const value = readSingleQueryValue(routeQuery.from);

  if (value === "watchlist" || value === "favorites") {
    return value;
  }

  return null;
};

export const buildCoinDetailsRoutePath = (symbol: string): string =>
  `/app/coins/${encodeURIComponent(symbol)}`;
