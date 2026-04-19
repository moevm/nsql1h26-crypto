import { AppPageShell } from "@/components/app-page-shell";
import { CoinFiltersPanel } from "@/components/coins/coin-filters-panel";
import { CoinTableSection } from "@/components/coins/coin-table-section";
import { useFavoritesView } from "@/hooks/favorites-view/use-favorites-view";
import type { WatchlistCoin } from "@/types/coins";
import { FAVORITES_COIN_TABLE_SORTABLE_COLUMNS } from "@/utils/coin-table-sorting";

const getFavoriteCoinHref = (coin: WatchlistCoin) =>
  `/app/coins/${encodeURIComponent(coin.symbol)}?from=favorites`;

export default function FavoritesPage() {
  const viewState = useFavoritesView();

  return (
    <AppPageShell
      activeSection="favorites"
      headTitle="Избранное | CryptoWatch"
      headDescription="Страница избранных монет"
      title="Избранные монеты"
      description="Фильтры, сортировка и список"
    >
      <section className="mt-8 space-y-8">
        <CoinFiltersPanel
          sectionLabel="Поиск и фильтр"
          title="Поиск и диапазоны"
          queryId="favorites-query"
          queryName="query"
          queryLabel="Поиск по названию или тикеру"
          queryPlaceholder="Название или тикер..."
          rangeIdPrefix="favorites"
          queryValue={viewState.query}
          onQueryChange={viewState.setQuery}
          ranges={viewState.ranges}
          onRangeChange={viewState.setRangeValue}
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-text-muted">
                Фильтры применяются автоматически. Поиск работает по загруженному списку.
              </p>
              <button
                className="cw-button-secondary"
                type="button"
                onClick={viewState.resetFilters}
                disabled={!viewState.hasActiveFilters}
              >
                Сбросить фильтры
              </button>
            </div>
          }
        />

        <CoinTableSection
          sectionLabel="Таблица монет"
          title="Список"
          status={viewState.status}
          errorTitle="Не удалось загрузить избранное"
          errorMessage={viewState.errorMessage}
          onRetry={viewState.retry}
          coins={viewState.coins}
          totalLabel={viewState.totalLabel}
          getCoinHref={getFavoriteCoinHref}
          onToggleFavorite={viewState.onToggleFavorite}
          getFavoriteActionLabel={viewState.getFavoriteActionLabel}
          isFavoriteActionPending={viewState.isFavoriteActionPending}
          sort={viewState.sort}
          onSortChange={viewState.requestSort}
          sortableColumns={FAVORITES_COIN_TABLE_SORTABLE_COLUMNS}
          pagination={viewState.pagination}
          emptyTitle={viewState.emptyState.title}
          emptyMessage={viewState.emptyState.message}
          emptyActionLabel={viewState.emptyState.actionLabel}
          onEmptyAction={viewState.emptyState.onAction}
        />
      </section>
    </AppPageShell>
  );
}
