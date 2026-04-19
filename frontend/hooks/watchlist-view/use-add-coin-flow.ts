import { useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { coinsService } from "@/services/coins/coins-service";
import type { AddToWatchlistResponse } from "@/types/coins";

interface UseAddCoinFlowOptions {
  reloadWatchlist: (options?: { showLoading?: boolean }) => Promise<void>;
}

interface UseAddCoinFlowResult {
  isSubmitting: boolean;
  submitCoin: (symbol: string) => Promise<void>;
}

const getSuccessMessage = (response: AddToWatchlistResponse, symbol: string): string => {
  return response.message ?? `${symbol} added to watchlist`;
};

export const useAddCoinFlow = ({
  reloadWatchlist
}: UseAddCoinFlowOptions): UseAddCoinFlowResult => {
  const { session, syncSessionUser } = useAuth();
  const { pushToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitCoin = async (symbol: string) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await coinsService.addToWatchlist(symbol);

      if (!response.success) {
        throw new Error(response.message ?? "Не удалось добавить монету");
      }

      const nextSymbol = response.coin?.symbol ?? symbol;

      if (session && !session.watchlist.includes(nextSymbol)) {
        syncSessionUser({
          ...session,
          watchlist: [...session.watchlist, nextSymbol],
          favorites: session.favorites
        });
      }

      try {
        await reloadWatchlist({ showLoading: false });
      } catch {
        pushToast({
          type: "success",
          message: getSuccessMessage(response, nextSymbol)
        });
        pushToast({
          type: "error",
          message: "Монета добавлена, но список не удалось обновить"
        });

        return;
      }

      pushToast({
        type: "success",
        message: getSuccessMessage(response, nextSymbol)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitCoin
  };
};
