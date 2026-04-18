import { AppLayout } from "@/components/app-layout";
import { CoinTable } from "@/components/coin-table";
import { PageHead } from "@/components/page-head";
import { ProtectedPage } from "@/components/protected-page";
import { RangeField } from "@/components/range-field";
import { ViewStateSection } from "@/components/view-state-section";
import { useWatchlistViewMock } from "@/hooks/use-watchlist-view-mock";

const AppHomePageContent = () => {
  const viewState = useWatchlistViewMock();

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
              disabled
            >
              Добавить монету
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
              </div>
            </div>
          </div>

          <div>
            <div className="cw-section-label">Расширенный фильтр</div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="cw-card-title">Диапазоны</h2>
            </div>

            <div className="cw-filter-grid">
              <RangeField id="price" label="Цена, USD" inputType="number" />
              <RangeField id="cap" label="Капитализация" inputType="number" />
              <RangeField id="change" label="Изменение за 24ч" inputType="number" />
              <RangeField id="volume" label="Объем торгов" inputType="number" />
            </div>
          </div>

          <div>
            <div className="cw-section-label">Таблица монет</div>
            <div className="mb-4">
              <h2 className="cw-card-title">Watchlist</h2>
            </div>

            <ViewStateSection
              status={viewState.status}
              errorTitle="Не удалось загрузить список"
              errorMessage="Попробуйте обновить данные еще раз"
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

export default function AppHomePage() {
  return (
    <ProtectedPage>
      <AppHomePageContent />
    </ProtectedPage>
  );
}
