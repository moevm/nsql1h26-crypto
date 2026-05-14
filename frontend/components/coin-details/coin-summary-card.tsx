import type { CoinDetails } from "@/types/coins";
import {
  formatPercentChange,
  formatUsdCompact,
  formatUsdPrice,
  getPercentChangeTone
} from "@/utils/coin-formatters";

interface CoinSummaryCardProps {
  coinDetails: CoinDetails;
  isFavoritePending: boolean;
  onToggleFavorite: () => void;
}

const updatedAtFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short"
});

export const CoinSummaryCard = ({
  coinDetails,
  isFavoritePending,
  onToggleFavorite
}: CoinSummaryCardProps) => {
  const changeTone = getPercentChangeTone(coinDetails.change24hPercent);
  const changeClassName =
    changeTone === "positive"
      ? "cw-positive"
      : changeTone === "negative"
        ? "cw-negative"
        : "cw-table-primary";
  const favoriteLabel = coinDetails.isFavorite ? "Убрать из избранного" : "Добавить в избранное";
  const metrics = [
    {
      label: "Текущая цена",
      value: formatUsdPrice(coinDetails.priceUsd),
      valueClassName: "cw-table-primary"
    },
    {
      label: "Изменение за 24ч",
      value: formatPercentChange(coinDetails.change24hPercent),
      valueClassName: changeClassName
    },
    {
      label: "Капитализация",
      value: formatUsdCompact(coinDetails.marketCapUsd),
      valueClassName: "cw-table-primary"
    },
    {
      label: "Объем за 24ч",
      value: formatUsdCompact(coinDetails.volume24hUsd),
      valueClassName: "cw-table-primary"
    },
    {
      label: "Мин. цена за 7 дней",
      value: formatUsdPrice(coinDetails.minPrice7d),
      valueClassName: "cw-table-primary"
    },
    {
      label: "Макс. цена за 7 дней",
      value: formatUsdPrice(coinDetails.maxPrice7d),
      valueClassName: "cw-table-primary"
    },
    {
      label: "Средняя цена за 7 дней",
      value: formatUsdPrice(coinDetails.avgPrice7d),
      valueClassName: "cw-table-primary"
    },
    {
      label: "Дата добавления",
      value: coinDetails.createdAt
        ? updatedAtFormatter.format(new Date(coinDetails.createdAt))
        : "—",
      valueClassName: "cw-table-primary"
    },
    {
      label: "Последнее обновление",
      value: updatedAtFormatter.format(new Date(coinDetails.lastUpdatedAt)),
      valueClassName: "cw-table-primary"
    }
  ];

  return (
    <section className="cw-panel-muted">
      <div className="flex flex-col gap-4 border-b border-dashed border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="cw-kicker">Сводка</p>
          <h2 className="cw-card-title mt-3 text-2xl" translate="no">
            {coinDetails.name}
          </h2>
          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-text-muted" translate="no">
            {coinDetails.symbol}
          </p>
        </div>

        <button
          type="button"
          className="cw-button-secondary gap-2 self-start"
          onClick={onToggleFavorite}
          disabled={isFavoritePending}
          aria-label={`${favoriteLabel}: ${coinDetails.symbol}`}
        >
          <span
            aria-hidden="true"
            className={coinDetails.isFavorite ? "cw-favorite" : "cw-favorite-muted"}
          >
            ★
          </span>
          <span>{isFavoritePending ? "Сохраняем..." : favoriteLabel}</span>
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="cw-card-surface">
            <p className="cw-kicker">{metric.label}</p>
            <p className={`${metric.valueClassName} mt-3 text-lg`}>{metric.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
