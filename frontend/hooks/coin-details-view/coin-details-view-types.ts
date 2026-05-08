import type { CoinDetails } from "@/types/coins";

export type CoinRouteSource = "watchlist" | "favorites";
export type CoinDetailsViewStatus = "loading" | "ready" | "error" | "notFound";

export interface UseCoinDetailsViewResult {
  coinDetails: CoinDetails | null;
  errorMessage: string;
  goBack: () => void;
  headDescription: string;
  headTitle: string;
  isFavoritePending: boolean;
  pageDescription: string;
  pageTitle: string;
  retry: () => Promise<void>;
  status: CoinDetailsViewStatus;
  symbol: string;
  toggleFavorite: () => Promise<void>;
}
