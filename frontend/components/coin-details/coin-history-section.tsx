import dynamic from "next/dynamic";

import { RangeField } from "@/components/coins/range-field";
import { ViewStateSection } from "@/components/view-state/view-state-section";
import type { UseCoinHistoryViewResult } from "@/hooks/coin-details-view/coin-history-view-types";
import { formatPercentChange, formatUsdCompact, formatUsdPrice, getPercentChangeTone } from "@/utils/coin-formatters";

interface CoinHistorySectionProps {
  viewState: UseCoinHistoryViewResult;
}

const historyTimestampFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short"
});

const CoinHistoryChartCard = dynamic(
  () =>
    import("@/components/coin-details/coin-history-chart-card").then(
      (module) => module.CoinHistoryChartCard
    ),
  {
    loading: () => (
      <section className="cw-surface-soft">
        <p className="cw-kicker">График цены</p>
        <h3 className="cw-card-title mt-3">Загружаем график...</h3>
        <div className="mt-6 h-80 rounded-[24px] border border-dashed border-border bg-white/60" />
      </section>
    ),
    ssr: false
  }
);

export const CoinHistorySection = ({ viewState }: CoinHistorySectionProps) => {
  const paginationControls = (
    <div className="flex items-center gap-3">
      <button
        className="cw-button-secondary"
        type="button"
        onClick={viewState.pagination.onPrevious}
        disabled={!viewState.pagination.canGoPrevious || viewState.pagination.isPending}
        aria-label="Предыдущая страница истории"
      >
        Назад
      </button>

      <span className="text-sm text-text-muted">
        Страница {viewState.pagination.currentPage} из {viewState.pagination.totalPages}
      </span>

      <button
        className="cw-button-secondary"
        type="button"
        onClick={viewState.pagination.onNext}
        disabled={!viewState.pagination.canGoNext || viewState.pagination.isPending}
        aria-label="Следующая страница истории"
      >
        Вперёд
      </button>
    </div>
  );

  return (
    <section className="space-y-6">
      <div>
        <div className="cw-section-label">История</div>
        <div className="mb-4">
          <h2 className="cw-card-title">Фильтры, график и записи</h2>
        </div>

        <div className="cw-panel-muted">
          <div className="cw-filter-grid">
            <RangeField
              id="coin-history-date"
              label="Период"
              inputType="date"
              startPlaceholder="Дата от"
              endPlaceholder="Дата до"
              startValue={viewState.filters.draft.dateFrom}
              endValue={viewState.filters.draft.dateTo}
              onStartChange={viewState.filters.onDateFromChange}
              onEndChange={viewState.filters.onDateToChange}
            />

            <RangeField
              id="coin-history-price"
              label="Цена, USD"
              inputType="number"
              startPlaceholder="Мин."
              endPlaceholder="Макс."
              startValue={viewState.filters.draft.priceMin}
              endValue={viewState.filters.draft.priceMax}
              onStartChange={viewState.filters.onPriceMinChange}
              onEndChange={viewState.filters.onPriceMaxChange}
            />

            <RangeField
              id="coin-history-volume"
              label="Объем торгов, USD"
              inputType="number"
              startPlaceholder="Мин."
              endPlaceholder="Макс."
              startValue={viewState.filters.draft.volumeMin}
              endValue={viewState.filters.draft.volumeMax}
              onStartChange={viewState.filters.onVolumeMinChange}
              onEndChange={viewState.filters.onVolumeMaxChange}
            />
          </div>

          <p
            className={`mt-4 text-sm ${
              viewState.filters.validationMessage ? "cw-negative" : "text-text-muted"
            }`}
          >
            {viewState.filters.validationMessage ?? "Фильтры применяются по кнопке"}
          </p>

          <div className="cw-toolbar mt-4">
            <div className="cw-toolbar-actions">
              <button
                className="cw-button-primary"
                type="button"
                onClick={viewState.filters.onApply}
                disabled={viewState.filters.isApplyDisabled}
              >
                {viewState.filters.isApplyPending ? "Применяем..." : "Применить"}
              </button>
              <button
                className="cw-button-ghost"
                type="button"
                onClick={viewState.filters.onReset}
                disabled={viewState.filters.isResetDisabled}
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      </div>

      <ViewStateSection
        status={viewState.status}
        loadingTitle="Загружаем историю..."
        loadingMessage="Получаем записи по монете и применяем фильтры"
        emptyTitle="Записи не найдены"
        emptyMessage="За выбранный период совпадений нет"
        emptyActionLabel="Сбросить фильтры"
        onEmptyAction={viewState.filters.onReset}
        errorTitle="Не удалось загрузить историю"
        errorMessage={viewState.errorMessage}
        onRetry={() => {
          void viewState.retry();
        }}
      >
        <div className="space-y-4">
          <CoinHistoryChartCard entries={viewState.entries} />

          <div className="cw-table-wrap">
            <table className="cw-table">
              <thead>
                <tr>
                  <th scope="col">Дата</th>
                  <th scope="col">Цена</th>
                  <th scope="col">Изменение 24ч</th>
                  <th scope="col">Капитализация</th>
                  <th scope="col">Объем 24ч</th>
                </tr>
              </thead>
              <tbody>
                {viewState.entries.map((entry) => {
                  const changeTone = getPercentChangeTone(entry.change24hPercent);

                  return (
                    <tr key={entry.timestamp}>
                      <td className="cw-table-primary">
                        {historyTimestampFormatter.format(new Date(entry.timestamp))}
                      </td>
                      <td>{formatUsdPrice(entry.priceUsd)}</td>
                      <td
                        className={
                          changeTone === "positive"
                            ? "cw-positive"
                            : changeTone === "negative"
                              ? "cw-negative"
                              : undefined
                        }
                      >
                        {formatPercentChange(entry.change24hPercent)}
                      </td>
                      <td>{formatUsdCompact(entry.marketCapUsd)}</td>
                      <td>{formatUsdCompact(entry.volume24hUsd)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="cw-pagination gap-4">
          <span>{viewState.totalLabel}</span>
          {paginationControls}
        </div>
      </ViewStateSection>
    </section>
  );
};
