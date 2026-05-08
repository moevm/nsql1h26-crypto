import Link from "next/link";

import type {
  CoinTableSortKey,
  CoinTableSortState,
  WatchlistCoin
} from "@/types/coins";
import type { CoinTableAction, CoinTableActionTone } from "@/types/coin-table";
import { DEFAULT_COIN_TABLE_SORTABLE_COLUMNS } from "@/utils/coin-table-sorting";
import {
  formatPercentChange,
  formatUsdCompact,
  formatUsdPrice,
  getPercentChangeTone
} from "@/utils/coin-formatters";

type SortOrderForAria = "ascending" | "descending" | "none";

interface CoinTableProps {
  coins: WatchlistCoin[];
  getCoinHref?: (coin: WatchlistCoin) => string;
  onToggleFavorite?: (coin: WatchlistCoin) => void | Promise<void>;
  getFavoriteActionLabel?: (coin: WatchlistCoin) => string;
  isFavoriteActionPending?: (coin: WatchlistCoin) => boolean;
  actions?: CoinTableAction[];
  sort?: CoinTableSortState | null;
  onSortChange?: (key: CoinTableSortKey) => void;
  sortableColumns?: readonly CoinTableSortKey[];
}

interface CoinTableColumn {
  key: string;
  label: string;
  sortKey?: CoinTableSortKey;
}

const COIN_TABLE_COLUMNS: CoinTableColumn[] = [
  { key: "name", label: "Название / тикер", sortKey: "name" },
  { key: "priceUsd", label: "Цена", sortKey: "priceUsd" },
  { key: "change24hPercent", label: "24ч", sortKey: "change24hPercent" },
  { key: "marketCapUsd", label: "Капитализация", sortKey: "marketCapUsd" },
  { key: "volume24hUsd", label: "Объем", sortKey: "volume24hUsd" },
  { key: "favorite", label: "Избранное" }
];

const getButtonClassName = (tone: CoinTableActionTone = "secondary"): string => {
  if (tone === "danger") {
    return "cw-button-danger";
  }

  if (tone === "ghost") {
    return "cw-button-ghost";
  }

  return "cw-button-secondary";
};

const getSortIndicator = (
  sort: CoinTableSortState | null | undefined,
  key: CoinTableSortKey
): string => {
  if (sort?.key !== key) {
    return "↕";
  }

  return sort.direction === "asc" ? "↑" : "↓";
};

const getSortAriaOrder = (
  sort: CoinTableSortState | null | undefined,
  key?: CoinTableSortKey
): SortOrderForAria | undefined => {
  if (!key) {
    return undefined;
  }

  if (sort?.key !== key) {
    return "none";
  }

  return sort.direction === "asc" ? "ascending" : "descending";
};

const getSortActionLabel = (
  label: string,
  sort: CoinTableSortState | null | undefined,
  key: CoinTableSortKey
): string => {
  if (sort?.key !== key) {
    return `Сортировать по столбцу «${label}» по возрастанию`;
  }

  if (sort.direction === "asc") {
    return `Сортировать по столбцу «${label}» по убыванию`;
  }

  return `Сбросить сортировку по столбцу «${label}»`;
};

export const CoinTable = ({
  coins,
  getCoinHref,
  onToggleFavorite,
  getFavoriteActionLabel,
  isFavoriteActionPending,
  actions = [],
  sort,
  onSortChange,
  sortableColumns = DEFAULT_COIN_TABLE_SORTABLE_COLUMNS
}: CoinTableProps) => {
  const hasActionsColumn = actions.length > 0;

  return (
    <div className="cw-table-wrap">
      <table className="cw-table">
        <thead>
          <tr>
            {COIN_TABLE_COLUMNS.map((column) => (
              <th
                key={column.key}
                scope="col"
                aria-sort={getSortAriaOrder(sort, column.sortKey)}
              >
                {column.sortKey && onSortChange && sortableColumns.includes(column.sortKey) ? (
                  <button
                    type="button"
                    className={`cw-table-sort-button ${
                      sort?.key === column.sortKey ? "cw-table-sort-button-active" : ""
                    }`}
                    onClick={() => onSortChange(column.sortKey!)}
                    aria-label={getSortActionLabel(column.label, sort, column.sortKey)}
                  >
                    <span>{column.label}</span>
                    <span className="cw-table-sort-indicator" aria-hidden="true">
                      {getSortIndicator(sort, column.sortKey)}
                    </span>
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
            {hasActionsColumn ? <th scope="col">Действия</th> : null}
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => {
            const changeTone = getPercentChangeTone(coin.change24hPercent);
            const coinHref = getCoinHref?.(coin);
            const favoriteButtonLabel =
              getFavoriteActionLabel?.(coin) ??
              (coin.isFavorite ? "Убрать из избранного" : "Добавить в избранное");
            const isFavoritePending = isFavoriteActionPending?.(coin) ?? false;
            const coinCopy = (
              <>
                <div className="cw-table-coin-copy">
                  <div
                    className={`cw-table-primary cw-table-coin-name ${
                      coinHref ? "cw-link" : ""
                    }`}
                  >
                    {coin.name}
                  </div>
                </div>
                <div
                  className="cw-table-coin-symbol mt-1 text-xs uppercase tracking-[0.14em] text-text-muted"
                  translate="no"
                >
                  {coin.symbol}
                </div>
              </>
            );

            return (
              <tr key={coin.symbol}>
                <td className="cw-table-cell-coin">
                  {coinHref ? (
                    <Link href={coinHref} className="block" aria-label={`Открыть ${coin.symbol}`}>
                      {coinCopy}
                    </Link>
                  ) : (
                    coinCopy
                  )}
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
                      onClick={() => {
                        void onToggleFavorite(coin);
                      }}
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
