import { useState } from "react";

import { useToastContext } from "@/components/toast-provider";
import { useAuth } from "@/hooks/use-auth";
import { coinsService } from "@/services/coins/coins-service";

interface UseAddCoinFlowOptions {
  reloadWatchlist: (options?: {
    showLoading?: boolean;
    preserveDataOnError?: boolean;
  }) => Promise<void>;
}

interface UseAddCoinFlowResult {
  isSubmitting: boolean;
  submitCoin: (symbol: string) => Promise<void>;
}

export const useAddCoinFlow = ({
  reloadWatchlist
}: UseAddCoinFlowOptions): UseAddCoinFlowResult => {
  const { session, syncSessionUser } = useAuth();
  const { pushToast } = useToastContext();
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
        await reloadWatchlist({
          showLoading: false,
          preserveDataOnError: true
        });
      } catch {
        pushToast({
          type: "success",
          message: response.message ?? `${nextSymbol} added to watchlist`
        });
        pushToast({
          type: "error",
          message: "Монета добавлена, но список не удалось обновить"
        });

        return;
      }

      pushToast({
        type: "success",
        message: response.message ?? `${nextSymbol} added to watchlist`
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
