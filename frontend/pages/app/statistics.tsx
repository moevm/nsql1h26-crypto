import { useState } from "react";
import { AppPageShell } from "@/components/app-page-shell";
import { RangeField } from "@/components/coins/range-field";
import { ViewStateSection } from "@/components/view-state/view-state-section";
import { useStatisticsView } from "@/hooks/statistics-view/use-statistics-view";
import type { ChartMetric } from "@/hooks/statistics-view/use-statistics-view";
import type { StatisticsPreset } from "@/types/statistics";

const StatisticsPageContent = () => {
  const { params, results, presets, chartBars, chartLabels, chartMaxValue, chartMetric, setChartMetric, selectedSymbols, build, retry, loadPreset } =
    useStatisticsView();

  const formatValue = (value: number, metric: ChartMetric): string => {
    const isVolume = metric === "avgVolume";
    const prefix = isVolume ? "" : "$";
    const suffix = isVolume ? "" : "";
    if (value >= 1_000_000_000) return `${prefix}${(value / 1_000_000_000).toFixed(1)}B${suffix}`;
    if (value >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(1)}M${suffix}`;
    if (value >= 1_000) return `${prefix}${(value / 1_000).toFixed(0)}k${suffix}`;
    return `${prefix}${value.toFixed(0)}${suffix}`;
  };

  const [symbolsInput, setSymbolsInput] = useState(() => params.currentParams.symbols.join(", "));
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [savePresetName, setSavePresetName] = useState("");

  const handleReset = () => {
    params.reset();
    setSymbolsInput("");
  };

  const handleLoadPreset = (preset: StatisticsPreset) => {
    loadPreset(preset);
    setSymbolsInput(preset.symbols.join(", "));
  };

  const handleSaveConfirm = async () => {
    if (!savePresetName.trim()) return;
    await presets.savePreset(params.currentParams, savePresetName.trim());
    setSavePresetName("");
    setShowSaveForm(false);
  };

  return (
    <AppPageShell
      activeSection="statistics"
      headTitle="Статистика | CryptoWatch"
      headDescription="Страница статистики"
      title="Статистика и сохраненная конфигурация"
      description="Параметры, график и сохраненка"
    >
      <section className="cw-toolbar">
        <div className="cw-toolbar-actions">
          <button className="cw-button-primary" form="stats-params-form" type="submit">
            Построить
          </button>
          <button
            className="cw-button-secondary"
            type="button"
            onClick={() => setShowSaveForm((v) => !v)}
          >
            Сохранить настройки
          </button>
          <button className="cw-button-ghost" type="button" onClick={handleReset}>
            Сбросить
          </button>
        </div>

        {showSaveForm && (
          <div className="mt-3 flex items-center gap-2">
            <input
              autoFocus
              className="cw-input max-w-xs"
              placeholder="Название пресета"
              type="text"
              value={savePresetName}
              onChange={(e) => setSavePresetName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveConfirm()}
            />
            <button className="cw-button-primary" type="button" onClick={handleSaveConfirm}>
              Подтвердить
            </button>
            <button
              className="cw-button-ghost"
              type="button"
              onClick={() => {
                setShowSaveForm(false);
                setSavePresetName("");
              }}
            >
              Отмена
            </button>
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <form id="stats-params-form" onSubmit={(e) => { e.preventDefault(); build(); }}>
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
                    placeholder="BTC, ETH, SOL..."
                    type="text"
                    value={symbolsInput}
                    onChange={(e) => {
                      const upper = e.target.value.toUpperCase();
                      setSymbolsInput(upper);
                      params.setSymbols(upper.split(",").map((s) => s.trim()).filter(Boolean));
                    }}
                  />
                </div>

                <RangeField
                  id="stats-range"
                  inputType="date"
                  label="Период"
                  startValue={params.timeRangeFrom}
                  endValue={params.timeRangeTo}
                  onStartChange={params.setTimeRangeFrom}
                  onEndChange={params.setTimeRangeTo}
                />

                <div>
                  <label className="cw-field-label" htmlFor="stats-aggregation">
                    Агрегация
                  </label>
                  <select
                    className="cw-input"
                    id="stats-aggregation"
                    value={params.aggregation}
                    onChange={(e) =>
                      params.setAggregation(
                        e.target.value as "hours" | "days" | "weeks"
                      )
                    }
                  >
                    <option value="hours">По часам</option>
                    <option value="days">По дням</option>
                    <option value="weeks">По неделям</option>
                  </select>
                </div>

                <RangeField
                  id="stats-price"
                  inputType="number"
                  label="Цена, USD"
                  startPlaceholder="Мин."
                  endPlaceholder="Макс."
                  startValue={params.minPrice !== null ? String(params.minPrice) : ""}
                  endValue={params.maxPrice !== null ? String(params.maxPrice) : ""}
                  onStartChange={(v) => params.setMinPrice(v ? parseFloat(v) : null)}
                  onEndChange={(v) => params.setMaxPrice(v ? parseFloat(v) : null)}
                />

                <div>
                  <label className="cw-field-label" htmlFor="stats-volume-min">
                    Минимальный объем
                  </label>
                  <input
                    className="cw-input"
                    id="stats-volume-min"
                    name="stats-volume-min"
                    placeholder="Например, 1000000..."
                    type="number"
                    value={params.minVolume !== null ? String(params.minVolume) : ""}
                    onChange={(e) =>
                      params.setMinVolume(e.target.value ? parseFloat(e.target.value) : null)
                    }
                  />
                </div>

                <div>
                  <label className="cw-field-label" htmlFor="stats-metric">
                    Метрика графика
                  </label>
                  <select
                    className="cw-input"
                    id="stats-metric"
                    value={chartMetric}
                    onChange={(e) => setChartMetric(e.target.value as ChartMetric)}
                  >
                    <option value="avgPrice">Средняя цена</option>
                    <option value="minPrice">Минимальная цена</option>
                    <option value="maxPrice">Максимальная цена</option>
                    <option value="avgVolume">Средний объём</option>
                  </select>
                </div>
              </div>
            </div>
          </form>

          <div>
            <div className="cw-section-label">График</div>
            <h2 className="cw-card-title mb-4">Результат</h2>

            <ViewStateSection
              status={results.status}
              errorTitle={results.errorDetails?.title || "Не удалось построить график"}
              errorMessage={results.errorDetails?.message || "Проверьте параметры и попробуйте снова"}
              onRetry={retry}
            >
              <div className="cw-surface overflow-hidden px-5 py-5 sm:px-6">
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  {selectedSymbols.map((symbol) => (
                    <span key={symbol} className="cw-chip">
                      {symbol}
                    </span>
                  ))}
                </div>

                <div className="cw-surface-soft relative">
                  <div className="pointer-events-none absolute inset-y-6 left-12 right-6 flex flex-col justify-between">
                    <div className="border-t border-dashed border-border"></div>
                    <div className="border-t border-dashed border-border"></div>
                    <div className="border-t border-dashed border-border"></div>
                    <div className="border-t border-dashed border-border"></div>
                  </div>

                  <div className="absolute left-0 top-0 flex h-[280px] w-10 flex-col justify-between py-1 pr-1">
                    {[1, 0.75, 0.5, 0.25, 0].map((pct) => (
                      <span
                        key={pct}
                        className="block text-right text-[10px] leading-none text-text-muted"
                      >
                        {formatValue(chartMaxValue * pct, chartMetric)}
                      </span>
                    ))}
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
                    {chartLabels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </ViewStateSection>
          </div>
        </div>

        <aside>
          <div className="cw-panel-muted">
            <h2 className="cw-card-title">Сохраненная конфигурация</h2>

            <div className="mt-4 space-y-4">
              {presets.presets.map((preset) => (
                <div key={preset.id} className="cw-card-surface">
                  <p className="cw-card-title text-base">{preset.name}</p>
                  <p className="mt-2 text-sm leading-6 text-text-main">
                    Монеты: {preset.symbols.join(", ")}
                  </p>
                  <p className="text-sm leading-6 text-text-main">
                    Период: {new Date(preset.timeRangeFrom).toLocaleDateString()} —{" "}
                    {new Date(preset.timeRangeTo).toLocaleDateString()}
                  </p>
                  <p className="text-sm leading-6 text-text-main">
                    Агрегация: {preset.aggregation}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="cw-button-secondary"
                      type="button"
                      onClick={() => handleLoadPreset(preset)}
                    >
                      Загрузить
                    </button>
                    <button
                      className="cw-button-ghost"
                      type="button"
                      onClick={() => presets.deletePreset(preset.id)}
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
    </AppPageShell>
  );
};

export default function StatisticsPage() {
  return <StatisticsPageContent />;
}
