import { AppPageShell } from "@/components/app-page-shell";
import { CoinFiltersPanel } from "@/components/coin-filters-panel";
import { CoinTableSection } from "@/components/coin-table-section";
import { useWatchlistViewMock } from "@/hooks/use-watchlist-view-mock";

const AppHomePageContent = () => {
  const viewState = useWatchlistViewMock();

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
          <button className="cw-button-primary" type="button" disabled>
            Добавить монету
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
        />

        <CoinTableSection
          sectionLabel="Таблица монет"
          title="Watchlist"
          status={viewState.status}
          errorTitle="Не удалось загрузить список"
          errorMessage="Попробуйте обновить данные еще раз"
          onRetry={viewState.retry}
          coins={viewState.coins}
          totalLabel={viewState.totalLabel}
        />
      </section>
    </AppPageShell>
  );
};

export default function AppHomePage() {
  return <AppHomePageContent />;
}
