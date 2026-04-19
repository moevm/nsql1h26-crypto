import { useRouter } from "next/router";

import { AppPageShell } from "@/components/app-page-shell";

type CoinRouteSource = "watchlist" | "favorites";

const getRouteSymbol = (value: string | string[] | undefined): string => {
  if (typeof value === "string" && value.trim()) {
    return value.trim().toUpperCase();
  }

  if (Array.isArray(value) && value[0]?.trim()) {
    return value[0].trim().toUpperCase();
  }

  return "";
};

const getRouteSource = (value: string | string[] | undefined): CoinRouteSource | null => {
  if (value === "watchlist" || value === "favorites") {
    return value;
  }

  if (Array.isArray(value) && (value[0] === "watchlist" || value[0] === "favorites")) {
    return value[0];
  }

  return null;
};

export default function CoinDetailsPage() {
  const router = useRouter();
  const symbol = getRouteSymbol(router.query.symbol);
  const source = getRouteSource(router.query.from);
  const symbolLabel = symbol || "...";
  const fallbackHref = source === "favorites" ? "/app/favorites" : "/app";

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();

      return;
    }

    void router.push(fallbackHref);
  };

  return (
    <AppPageShell
      activeSection="coins"
      headTitle={symbol ? `${symbol} | CryptoWatch` : "Монета | CryptoWatch"}
      headDescription="Страница монеты"
      title={symbol ? `Монета ${symbol}` : "Монета"}
      description="Временная страница"
    >
      <section className="mt-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <button className="cw-button-secondary" type="button" onClick={handleBack}>
            Назад
          </button>

          <span className="cw-auth-badge" translate="no">
            {symbolLabel}
          </span>
        </div>

        <div className="cw-surface p-6 sm:p-8">
          <p className="cw-kicker">Временный экран</p>
          <h2 className="cw-card-title mt-3 text-2xl" translate="no">
            {symbolLabel}
          </h2>
          <p className="cw-auth-copy mt-4 max-w-2xl text-sm leading-7 sm:text-base">
            Полная страница монеты появится позже
          </p>
        </div>
      </section>
    </AppPageShell>
  );
}
