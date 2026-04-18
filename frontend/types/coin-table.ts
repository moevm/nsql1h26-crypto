import type { WatchlistCoin } from "@/types/coins";

export type CoinTableActionTone = "secondary" | "ghost" | "danger";

export interface CoinTableAction {
  key: string;
  label: string;
  tone?: CoinTableActionTone;
  onClick: (coin: WatchlistCoin) => void;
  getAriaLabel?: (coin: WatchlistCoin) => string;
  isDisabled?: (coin: WatchlistCoin) => boolean;
  isPending?: (coin: WatchlistCoin) => boolean;
  pendingLabel?: string;
}
