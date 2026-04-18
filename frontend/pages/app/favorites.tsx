import { AppPageShell } from "@/components/app-page-shell";
import { CoinFiltersPanel } from "@/components/coins/coin-filters-panel";
import { CoinTableSection } from "@/components/coins/coin-table-section";
import { useFavoritesViewMock } from "@/hooks/mock-views/use-favorites-view-mock";

const FavoritesPageContent = () => {
  const viewState = useFavoritesViewMock();

  return (
    <AppPageShell
      activeSection="favorites"
      headTitle="Избранное | CryptoWatch"
      headDescription="Страница избранных монет"
      title="Избранные монеты"
      description="Поиск, фильтр и список избранного"
    >
      <section className="mt-8 space-y-8">
        <CoinFiltersPanel
          sectionLabel="Панель фильтров"
          title="Поиск и фильтр"
          queryId="favorites-query"
          queryName="favorites-query"
          queryLabel="Поиск"
          queryPlaceholder="Название, тикер или любой атрибут..."
          rangeIdPrefix="favorites"
        >
          <div>
            <label className="cw-field-label" htmlFor="favorites-sort">
              Сортировка
            </label>
            <select className="cw-input" id="favorites-sort" defaultValue="change-desc">
              <option value="change-desc">24ч: по убыванию</option>
              <option value="price-desc">Цена: по убыванию</option>
              <option value="cap-desc">Капитализация: по убыванию</option>
            </select>
          </div>
        </CoinFiltersPanel>

        <CoinTableSection
          sectionLabel="Таблица монет"
          title="Список"
          status={viewState.status}
          errorTitle="Не удалось загрузить избранное"
          errorMessage="Попробуйте повторить запрос"
          onRetry={viewState.retry}
          coins={viewState.coins}
          totalLabel={viewState.totalLabel}
        />
      </section>
    </AppPageShell>
  );
};

export default function FavoritesPage() {
  return <FavoritesPageContent />;
}
