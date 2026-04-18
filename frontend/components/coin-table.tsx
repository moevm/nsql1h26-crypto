import type { WatchlistCoin } from "@/types/coins";
import type { CoinTableAction, CoinTableActionTone } from "@/types/ui";
import {
  formatPercentChange,
  formatUsdCompact,
  formatUsdPrice,
  getPercentChangeTone
} from "@/utils/coin-formatters";

interface CoinTableProps {
  coins: WatchlistCoin[];
  onToggleFavorite?: (coin: WatchlistCoin) => void;
  getFavoriteActionLabel?: (coin: WatchlistCoin) => string;
  isFavoriteActionPending?: (coin: WatchlistCoin) => boolean;
  actions?: CoinTableAction[];
}

const getButtonClassName = (tone: CoinTableActionTone = "secondary"): string => {
  if (tone === "danger") {
    return "cw-button-danger";
  }

  if (tone === "ghost") {
    return "cw-button-ghost";
  }

  return "cw-button-secondary";
};

export const CoinTable = ({
  coins,
  onToggleFavorite,
  getFavoriteActionLabel,
  isFavoriteActionPending,
  actions = []
}: CoinTableProps) => {
  const hasActionsColumn = actions.length > 0;

  return (
    <div className="cw-table-wrap">
      <table className="cw-table">
        <thead>
          <tr>
            <th scope="col">Название / тикер</th>
            <th scope="col">Цена</th>
            <th scope="col">24ч</th>
            <th scope="col">Капитализация</th>
            <th scope="col">Объем</th>
            <th scope="col">Избранное</th>
            {hasActionsColumn ? <th scope="col">Действия</th> : null}
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => {
            const changeTone = getPercentChangeTone(coin.change24hPercent);
            const favoriteButtonLabel =
              getFavoriteActionLabel?.(coin) ??
              (coin.isFavorite ? "Убрать из избранного" : "Добавить в избранное");
            const isFavoritePending = isFavoriteActionPending?.(coin) ?? false;

            return (
              <tr key={coin.symbol}>
                <td>
                  <div className="cw-table-primary">{coin.name}</div>
                  <div
                    className="mt-1 text-xs uppercase tracking-[0.14em] text-text-muted"
                    translate="no"
                  >
                    {coin.symbol}
                  </div>
                </td>
                <td className="cw-table-primary">{formatUsdPrice(coin.priceUsd)}</td>
                <td
                  className={
                    changeTone === "positive"
                      ? "cw-positive"
                      : changeTone === "negative"
                        ? "cw-negative"
                        : undefined
                  }
                >
                  {formatPercentChange(coin.change24hPercent)}
                </td>
                <td>{formatUsdCompact(coin.marketCapUsd)}</td>
                <td>{formatUsdCompact(coin.volume24hUsd)}</td>
                <td>
                  {onToggleFavorite ? (
                    <button
                      type="button"
                      className={`cw-favorite-button ${
                        coin.isFavorite ? "cw-favorite-button-active" : "cw-favorite-button-muted"
                      }`}
                      onClick={() => onToggleFavorite(coin)}
                      disabled={isFavoritePending}
                      aria-label={`${favoriteButtonLabel}: ${coin.symbol}`}
                    >
                      {isFavoritePending ? "..." : "★"}
                    </button>
                  ) : (
                    <span
                      aria-label={coin.isFavorite ? "В избранном" : "Не в избранном"}
                      className={coin.isFavorite ? "cw-favorite" : "cw-favorite-muted"}
                    >
                      ★
                    </span>
                  )}
                </td>
                {hasActionsColumn ? (
                  <td>
                    <div className="cw-table-actions">
                      {actions.map((action) => {
                        const isPending = action.isPending?.(coin) ?? false;
                        const isDisabled = action.isDisabled?.(coin) ?? false;

                        return (
                          <button
                            key={action.key}
                            type="button"
                            className={`${getButtonClassName(action.tone)} cw-table-action-button`}
                            onClick={() => action.onClick(coin)}
                            disabled={isDisabled || isPending}
                            aria-label={action.getAriaLabel?.(coin) ?? `${action.label}: ${coin.symbol}`}
                          >
                            {isPending ? action.pendingLabel ?? "..." : action.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
