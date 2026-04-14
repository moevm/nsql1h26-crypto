import { AppLayout } from "@/components/app-layout";
import { PageHead } from "@/components/page-head";
import { RangeField } from "@/components/range-field";
import { useToast } from "@/hooks/use-toast";
import { statisticsToastMessages } from "@/utils/toast-mocks";
import { statisticsPresets } from "@/utils/ui-mocks";

const chartBars = [34, 42, 39, 51, 55, 60, 58, 66, 69, 74, 72, 79];

export default function StatisticsPage() {
  const { pushToast } = useToast();

  return (
    <>
      <PageHead 
        title="Статистика | CryptoWatch" 
        description="Страница статистики"
      />

      <AppLayout
        activeSection="statistics"
        title="Статистика и сохраненная конфигурация"
        description="Параметры, график и сохраненка"
      >
        <section className="cw-toolbar">
          <div className="cw-toolbar-actions">
            <button
              className="cw-button-primary"
              type="button"
              onClick={() => pushToast(statisticsToastMessages.chartBuilt)}
            >
              Построить
            </button>
            <button
              className="cw-button-secondary"
              type="button"
              onClick={() => pushToast(statisticsToastMessages.presetSaved)}
            >
              Сохранить настройки
            </button>
            <button
              className="cw-button-ghost"
              type="button"
              onClick={() => pushToast(statisticsToastMessages.formReset)}
            >
              Сбросить
            </button>
          </div>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            <div>
              <div className="cw-section-label">Параметры</div>
              <div className="cw-panel-muted">
                <div className="mb-6">
                  <h2 className="cw-card-title">Форма</h2>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <label className="cw-field-label" htmlFor="stats-symbols">
                      Валютные пары
                    </label>
                    <input
                      className="cw-input"
                      id="stats-symbols"
                      name="stats-symbols"
                      placeholder="BTC, ETH, SOL"
                      type="text"
                    />
                  </div>
                  <RangeField id="stats-from" label="Период" />
                  <div>
                    <label className="cw-field-label" htmlFor="stats-aggregation">
                      Агрегация
                    </label>
                    <select className="cw-input" defaultValue="days" id="stats-aggregation">
                      <option value="hours">По часам</option>
                      <option value="days">По дням</option>
                      <option value="weeks">По неделям</option>
                    </select>
                  </div>
                  <RangeField
                    id="stats-price-min"
                    label="Цена, USD"
                    startPlaceholder="Мин."
                    endPlaceholder="Макс."
                  />
                  <div>
                    <label className="cw-field-label" htmlFor="stats-volume-min">
                      Минимальный объем
                    </label>
                    <input
                      className="cw-input"
                      id="stats-volume-min"
                      name="stats-volume-min"
                      placeholder="Например, 1000000"
                      type="text"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="cw-section-label">График</div>
              <div className="mb-4">
                <h2 className="cw-card-title">Результат</h2>
              </div>

              <div className="cw-surface overflow-hidden px-5 py-5 sm:px-6">
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <span className="cw-chip">BTC</span>
                  <span className="cw-chip">ETH</span>
                  <span className="cw-chip">SOL</span>
                </div>

                <div className="relative rounded-[28px] border border-border bg-white/80 px-4 py-6 sm:px-6">
                  <div className="pointer-events-none absolute inset-y-6 left-12 right-6 flex flex-col justify-between">
                    <div className="border-t border-dashed border-border"></div>
                    <div className="border-t border-dashed border-border"></div>
                    <div className="border-t border-dashed border-border"></div>
                    <div className="border-t border-dashed border-border"></div>
                  </div>

                  <div className="relative flex h-[280px] items-end gap-3 pl-10 pr-2">
                    {chartBars.map((value, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-[18px] bg-brand/80"
                        style={{ height: `${value}%` }}
                      />
                    ))}
                  </div>

                  <div className="mt-5 flex justify-between pl-10 text-xs uppercase tracking-[0.14em] text-text-muted">
                    <span>1 нед</span>
                    <span>2 нед</span>
                    <span>3 нед</span>
                    <span>4 нед</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside>
            <div className="cw-panel-muted">
              <h2 className="cw-card-title">Сохраненная конфигурация</h2>

              <div className="mt-4 space-y-4">
                {statisticsPresets.map((preset) => (
                  <div
                    key={preset.name}
                    className="rounded-[24px] border border-border bg-white/70 p-4"
                  >
                    <p className="cw-card-title text-base">{preset.name}</p>
                    <p className="mt-2 text-sm leading-6 text-text-main">Монеты: {preset.symbols}</p>
                    <p className="text-sm leading-6 text-text-main">Период: {preset.range}</p>
                    <p className="text-sm leading-6 text-text-main">
                      Агрегация: {preset.aggregation}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button
                        className="cw-button-secondary"
                        type="button"
                        onClick={() => pushToast(statisticsToastMessages.presetLoaded(preset.name))}
                      >
                        Загрузить
                      </button>
                      <button
                        className="cw-button-ghost"
                        type="button"
                        onClick={() => pushToast(statisticsToastMessages.presetRemoved(preset.name))}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </AppLayout>
    </>
  );
}
