import { AppLayout } from "@/components/app-layout";
import { CoinTable } from "@/components/coin-table";
import { ErrorState } from "@/components/error-state";
import { useDemoErrorState } from "@/hooks/use-demo-error-state";
import { PageHead } from "@/components/page-head";
import { RangeField } from "@/components/range-field";
import { useToast } from "@/hooks/use-toast";
import { watchlistToastMessages } from "@/utils/toast-mocks";
import { watchlistRows } from "@/utils/ui-mocks";

export default function AppHomePage() {
  const { pushToast } = useToast();
  const showErrorState = useDemoErrorState();

  return (
    <>
      <PageHead 
        title="Монеты | CryptoWatch" 
        description="Главная страница watchlist" 
      />

      <AppLayout
        activeSection="coins"
        title="Список отслеживаемых монет"
        description="Поиск, фильтр, таблица"
      >
        <section className="cw-toolbar">
          <div className="cw-toolbar-actions">
            <button
              className="cw-button-primary"
              type="button"
              onClick={() => pushToast(watchlistToastMessages.addCoinPending)}
            >
              Добавить монету
            </button>
            <button
              className="cw-button-secondary"
              type="button"
              onClick={() => pushToast(watchlistToastMessages.comparePending)}
            >
              Сравнить
            </button>
          </div>
        </section>

        <section className="mt-8 space-y-6">
          <div>
            <div className="cw-section-label">Поиск и фильтр</div>
            <div className="cw-panel-muted">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex-1">
                  <label className="cw-field-label" htmlFor="watchlist-query">
                    Глобальный поиск
                  </label>
                  <input
                    className="cw-input"
                    id="watchlist-query"
                    name="query"
                    placeholder="Название или тикер"
                    type="search"
                  />
                </div>
                <div className="lg:pt-7">
                  <button
                    className="cw-button-secondary"
                    type="button"
                    onClick={() => pushToast(watchlistToastMessages.filtersShown)}
                  >
                    Фильтры
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="cw-section-label">Расширенный фильтр</div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="cw-card-title">Диапазоны</h2>
              <div className="flex gap-3">
                <button
                  className="cw-button-primary"
                  type="button"
                  onClick={() => pushToast(watchlistToastMessages.filtersApplied)}
                >
                  Применить
                </button>
                <button
                  className="cw-button-secondary"
                  type="button"
                  onClick={() => pushToast(watchlistToastMessages.filtersReset)}
                >
                  Сбросить
                </button>
              </div>
            </div>

            <div className="cw-filter-grid">
              <RangeField id="price-min" label="Цена, USD" />
              <RangeField id="cap-min" label="Капитализация" />
              <RangeField id="change-min" label="Изменение за 24ч" />
              <RangeField id="volume-min" label="Объем торгов" />
            </div>
          </div>

          <div>
            <div className="cw-section-label">Таблица монет</div>
            <div className="mb-4">
              <h2 className="cw-card-title">Watchlist</h2>
            </div>

            {showErrorState ? (
              <ErrorState
                title="Не удалось загрузить список"
                message="Попробуйте обновить данные еще раз"
                onAction={() => pushToast(watchlistToastMessages.filtersShown)}
              />
            ) : (
              <>
                <CoinTable rows={watchlistRows} />

                <div className="cw-pagination">
                  <span>Показано 1-4 из 24 монет</span>
                  <div className="flex gap-2">
                    <span className="cw-page-pill cw-page-pill-active">1</span>
                    <span className="cw-page-pill">2</span>
                    <span className="cw-page-pill">3</span>
                    <span className="cw-page-pill">...</span>
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
