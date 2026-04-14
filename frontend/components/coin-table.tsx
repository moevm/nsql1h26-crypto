import type { FavoriteRow, WatchlistRow } from "@/types/ui";

type CoinTableRow = FavoriteRow | WatchlistRow;

interface CoinTableProps {
  rows: CoinTableRow[];
}

const hasFavorite = (row: CoinTableRow): row is WatchlistRow => "favorite" in row;

export const CoinTable = ({ rows }: CoinTableProps) => {
  return (
    <div className="cw-table-wrap">
      <table className="cw-table">
        <thead>
          <tr>
            <th>Название / тикер</th>
            <th>Цена</th>
            <th>24ч</th>
            <th>Капитализация</th>
            <th>Объем</th>
            <th>Избранное</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((coin) => {
            const isFavorite = hasFavorite(coin) ? coin.favorite : true;

            return (
              <tr key={coin.symbol}>
                <td>
                  <div className="cw-table-primary">{coin.name}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.14em] text-text-muted">
                    {coin.symbol}
                  </div>
                </td>
                <td className="cw-table-primary">{coin.price}</td>
                <td className={coin.change.startsWith("-") ? "cw-negative" : "cw-positive"}>
                  {coin.change}
                </td>
                <td>{coin.cap}</td>
                <td>{coin.volume}</td>
                <td aria-label={isFavorite ? "В избранном" : "Не в избранном"}>
                  <span className={isFavorite ? "cw-favorite" : "cw-favorite-muted"}>★</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
