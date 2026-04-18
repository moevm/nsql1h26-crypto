import { AppPageShell } from "@/components/app-page-shell";
import { CoinFiltersPanel } from "@/components/coins/coin-filters-panel";
import { CoinTableSection } from "@/components/coins/coin-table-section";
import { useWatchlistView } from "@/hooks/watchlist-view/use-watchlist-view";

const AppHomePageContent = () => {
  const viewState = useWatchlistView();

  return (
    <AppPageShell
      activeSection="coins"
      headTitle="Монеты | CryptoWatch"
      headDescription="Главная страница watchlist"
      title="Список отслеживаемых монет"
      description="Поиск, фильтр, таблица"
    >
      <section className="cw-toolbar">
        <div className="cw-toolbar-actions">
          <button
            className="cw-button-primary"
            type="button"
            onClick={viewState.handleAddCoin}
          >
            Добавить монету
          </button>
          <button
            className="cw-button-secondary"
            type="button"
            onClick={() => void viewState.refreshWatchlist()}
            disabled={viewState.isRefreshPending}
          >
            {viewState.isRefreshPending ? "Обновляем..." : "Обновить"}
          </button>
        </div>
      </section>

      <section className="mt-8 space-y-6">
        <CoinFiltersPanel
          sectionLabel="Поиск и фильтр"
          title="Поиск и диапазоны"
          queryId="watchlist-query"
          queryName="query"
          queryLabel="Глобальный поиск"
          queryPlaceholder="Название или тикер..."
          rangeIdPrefix="watchlist"
          queryValue={viewState.query}
          onQueryChange={viewState.setQuery}
          ranges={viewState.ranges}
          onRangeChange={viewState.setRangeValue}
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-text-muted">Фильтры применяются сразу</p>
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
          title="Watchlist"
          status={viewState.status}
          errorTitle="Не удалось загрузить список"
          errorMessage={viewState.errorMessage}
          onRetry={viewState.retry}
          coins={viewState.coins}
          totalLabel={viewState.totalLabel}
          onToggleFavorite={viewState.onToggleFavorite}
          getFavoriteActionLabel={viewState.getFavoriteActionLabel}
          isFavoriteActionPending={viewState.isFavoriteActionPending}
          actions={viewState.actions}
          sort={viewState.sort}
          onSortChange={viewState.requestSort}
          emptyTitle={viewState.emptyState.title}
          emptyMessage={viewState.emptyState.message}
          emptyActionLabel={viewState.emptyState.actionLabel}
          onEmptyAction={viewState.emptyState.onAction}
        />
      </section>
    </AppPageShell>
  );
};

export default function AppHomePage() {
  return <AppHomePageContent />;
}
