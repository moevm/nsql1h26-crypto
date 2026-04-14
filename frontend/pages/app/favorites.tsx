import { AppLayout } from "@/components/app-layout";
import { CoinTable } from "@/components/coin-table";
import { ErrorState } from "@/components/error-state";
import { useDemoErrorState } from "@/hooks/use-demo-error-state";
import { PageHead } from "@/components/page-head";
import { RangeField } from "@/components/range-field";
import { useToast } from "@/hooks/use-toast";
import { favoritesToastMessages } from "@/utils/toast-mocks";
import { favoriteRows } from "@/utils/ui-mocks";

export default function FavoritesPage() {
  const { pushToast } = useToast();
  const showErrorState = useDemoErrorState();

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
        <section className="cw-toolbar">
          <div className="cw-toolbar-actions">
            <button
              className="cw-button-primary"
              type="button"
              onClick={() => pushToast(favoritesToastMessages.filtersApplied)}
            >
              Применить фильтр
            </button>
            <button
              className="cw-button-secondary"
              type="button"
              onClick={() => pushToast(favoritesToastMessages.filtersReset)}
            >
              Сбросить
            </button>
          </div>
        </section>

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
                <RangeField id="favorites-price-min" label="Цена, USD" />
                <RangeField id="favorites-cap-min" label="Капитализация" />
                <RangeField id="favorites-change-min" label="Изменение за 24ч" />
                <RangeField id="favorites-volume-min" label="Объем торгов" />
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

            {showErrorState ? (
              <ErrorState
                title="Не удалось загрузить избранное"
                message="Попробуйте повторить запрос"
                onAction={() => pushToast(favoritesToastMessages.filtersApplied)}
              />
            ) : (
              <>
                <CoinTable rows={favoriteRows} />

                <div className="cw-pagination">
                  <span>Показано 1-3 из 11 избранных монет</span>
                  <div className="flex gap-2">
                    <span className="cw-page-pill cw-page-pill-active">1</span>
                    <span className="cw-page-pill">2</span>
                    <span className="cw-page-pill">3</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </AppLayout>
    </>
  );
}
