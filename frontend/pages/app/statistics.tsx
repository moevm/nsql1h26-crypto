import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { AppPageShell } from "@/components/app-page-shell";
import { RangeField } from "@/components/coins/range-field";
import { ViewStateSection } from "@/components/view-state/view-state-section";
import { useStatisticsView } from "@/hooks/statistics-view/use-statistics-view";
import type { ChartMetric } from "@/hooks/statistics-view/use-statistics-view";
import type { StatisticsPreset } from "@/types/statistics";
import { BRAND, GRID, MUTED, TEXT, TOOLTIP_BG, TOOLTIP_BORDER, defaultDataZoom, tickFormatter } from "@/utils/chart-theme";

const formatValue = (value: number, metric: ChartMetric): string => {
  const prefix = metric === "avgVolume" ? "" : "$";
  if (value >= 1_000_000_000) return `${prefix}${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${prefix}${(value / 1_000).toFixed(0)}k`;
  return `${prefix}${value.toFixed(0)}`;
};

const StatisticsPageContent = () => {
  const { params, results, presets, chartValues, chartTimestamps, chartMetric, setChartMetric, selectedSymbols, dateValidationMessage, build, retry, loadPreset } =
    useStatisticsView();

  const chartOption = useMemo(() => ({
    grid: { top: 8, right: 12, bottom: 52, left: 8, containLabel: true },
    xAxis: {
      type: "category",
      data: chartTimestamps.map((ts) => tickFormatter.format(new Date(ts))),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: MUTED, fontSize: 11 }
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: MUTED, fontSize: 11, formatter: (v: number) => formatValue(v, chartMetric) },
      splitLine: { lineStyle: { color: GRID, type: "dashed" } }
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: TOOLTIP_BG,
      borderColor: TOOLTIP_BORDER,
      borderRadius: 18,
      textStyle: { color: TEXT, fontSize: 13 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any[]) => {
        const p = params[0];
        if (!p) return "";
        return `${String(p.axisValue)}<br/><b>${formatValue(Number(p.value), chartMetric)}</b>`;
      }
    },
    dataZoom: defaultDataZoom,
    series: [
      {
        type: "bar",
        data: chartValues,
        itemStyle: { color: BRAND, borderRadius: [18, 18, 0, 0] },
        barMaxWidth: 48
      }
    ]
  }), [chartTimestamps, chartValues, chartMetric]);

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
          <button className="cw-button-primary" form="stats-params-form" type="submit" disabled={!!dateValidationMessage}>
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
          <form id="stats-params-form" onSubmit={(e) => { e.preventDefault(); build(); }} onKeyDown={(e) => { if (e.key === "Enter" && (e.target as HTMLInputElement).type === "date") e.currentTarget.requestSubmit(); }}>
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
              {dateValidationMessage && (
                <p className="mt-4 text-sm cw-negative">{dateValidationMessage}</p>
              )}
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
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  {selectedSymbols.map((symbol) => (
                    <span key={symbol} className="cw-chip">
                      {symbol}
                    </span>
                  ))}
                </div>

                <div className="h-72 w-full">
                  <ReactECharts option={chartOption} style={{ height: "100%", width: "100%" }} />
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
