import { AppLayout } from "@/components/app-layout";
import { CoinTable } from "@/components/coin-table";
import { useFavoritesViewMock } from "@/hooks/use-favorites-view-mock";
import { PageHead } from "@/components/page-head";
import { ProtectedPage } from "@/components/protected-page";
import { RangeField } from "@/components/range-field";
import { ViewStateSection } from "@/components/view-state-section";

const FavoritesPageContent = () => {
  const viewState = useFavoritesViewMock();

  return (
    <>
      <PageHead 
        title="Избранное | CryptoWatch" 
        description="Страница избранных монет" 
      />

      <AppLayout
        activeSection="favorites"
        title="Избранные монеты"
        description="Поиск, фильтр и список избранного"
      >
        <section className="mt-8 space-y-8">
          <div>
            <div className="cw-section-label">Панель фильтров</div>
            <div className="cw-panel-muted">
              <h2 className="cw-card-title">Поиск и фильтр</h2>

              <div className="mt-6">
                <label className="cw-field-label" htmlFor="favorites-query">
                  Поиск
                </label>
                <input
                  className="cw-input"
                  id="favorites-query"
                  name="favorites-query"
                  placeholder="Название, тикер или любой атрибут"
                  type="search"
                />
              </div>

              <div className="cw-filter-grid mt-6">
                <RangeField id="favorites-price" label="Цена, USD" inputType="number" />
                <RangeField id="favorites-cap" label="Капитализация" inputType="number" />
                <RangeField id="favorites-change" label="Изменение за 24ч" inputType="number" />
                <RangeField id="favorites-volume" label="Объем торгов" inputType="number" />
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
              </div>
            </div>
          </div>

          <div>
            <div className="cw-section-label">Таблица монет</div>
            <div className="mb-4">
              <h2 className="cw-card-title">Список</h2>
            </div>

            <ViewStateSection
              status={viewState.status}
              errorTitle="Не удалось загрузить избранное"
              errorMessage="Попробуйте повторить запрос"
              onRetry={viewState.retry}
            >
              <>
                <CoinTable coins={viewState.coins} />

                <div className="cw-pagination">
                  <span>{viewState.totalLabel}</span>
                </div>
              </>
            </ViewStateSection>
          </div>
        </section>
      </AppLayout>
    </>
  );
};

export default function FavoritesPage() {
  return (
    <ProtectedPage>
      <FavoritesPageContent />
    </ProtectedPage>
  );
}
