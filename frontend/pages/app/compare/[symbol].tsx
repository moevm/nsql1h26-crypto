import { AppPageShell } from "@/components/app-page-shell";
import { CompareBoxPlotChart } from "@/components/compare/compare-boxplot-chart";
import { CompareLinearChart } from "@/components/compare/compare-linear-chart";
import { ErrorState } from "@/components/view-state/error-state";
import { LoadingState } from "@/components/view-state/loading-state";
import type { CompareDatePreset } from "@/hooks/compare-view/compare-view-types";
import { useCompareView } from "@/hooks/compare-view/use-compare-view";

const DATE_PRESETS: { label: string; value: CompareDatePreset }[] = [
  { label: "7д", value: "7d" },
  { label: "30д", value: "30d" },
  { label: "90д", value: "90d" }
];

export default function ComparePage() {
  const v = useCompareView();

  return (
    <AppPageShell
      activeSection="coins"
      headTitle={v.headTitle}
      headDescription="Сравнение динамики цен монет"
      title={v.pageTitle}
      description="Линейный график и box plot за выбранный период"
    >
      <section className="mt-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <button className="cw-button-secondary" type="button" onClick={v.goBack}>
            Назад
          </button>
          <span className="cw-auth-badge" translate="no">{v.symbol1}</span>
          {v.extraSymbols.map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span className="text-muted-foreground">vs</span>
              <span className="cw-auth-badge" translate="no">{s}</span>
            </span>
          ))}
        </div>

        <form
          className="cw-surface-soft space-y-4"
          onSubmit={(e) => { e.preventDefault(); if (v.canCompare && v.status !== "loading") void v.onCompare(); }}
        >
          <div className="flex flex-col gap-1">
            <label className="cw-kicker">Добавить монету</label>
            {v.extraSymbols.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {v.extraSymbols.map((s) => (
                  <span key={s} className="flex items-center gap-1 rounded-full border border-border bg-accent px-3 py-1 text-sm">
                    <span translate="no">{s}</span>
                    <button
                      type="button"
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      onClick={() => v.onRemoveSymbol(s)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <input
                className="cw-input w-full"
                placeholder="Введите тикер (например, ETH)"
                value={v.searchQuery}
                onChange={(e) => v.onSearchQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && v.searchResults.length > 0) {
                    e.preventDefault();
                    v.onAddSymbol(v.searchResults[0].symbol);
                  }
                }}
                autoComplete="off"
              />
              {v.searchResults.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-md">
                  {v.searchResults.slice(0, 8).map((coin) => (
                    <li key={coin.symbol}>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                        onClick={() => v.onAddSymbol(coin.symbol)}
                      >
                        <span className="font-medium" translate="no">{coin.symbol}</span>
                        <span className="ml-2 text-muted-foreground">{coin.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="cw-kicker">Период</label>
            <div className="flex flex-wrap items-center gap-2">
              {DATE_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={v.datePreset === p.value ? "cw-button-primary" : "cw-button-secondary"}
                  onClick={() => v.onDatePresetChange(p.value)}
                >
                  {p.label}
                </button>
              ))}
              <input
                type="date"
                className="cw-input"
                value={v.dateFrom.slice(0, 10)}
                onChange={(e) => v.onDateFromChange(`${e.target.value}T00:00:00.000Z`)}
              />
              <span className="text-muted-foreground">—</span>
              <input
                type="date"
                className="cw-input"
                value={v.dateTo.slice(0, 10)}
                onChange={(e) => v.onDateToChange(`${e.target.value}T23:59:59.999Z`)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="cw-button-primary"
            disabled={!v.canCompare || v.status === "loading"}
          >
            {v.status === "loading" ? "Загрузка..." : "Построить"}
          </button>
        </form>

        {v.status === "loading" && (
          <LoadingState title="Загружаем данные..." message="Сравниваем монеты за выбранный период" />
        )}

        {v.status === "error" && (
          <ErrorState
            title="Не удалось выполнить сравнение"
            message={v.errorMessage}
            onAction={() => {
              void v.onCompare();
            }}
          />
        )}

        {v.status === "ready" && v.compareData && (
          <div className="space-y-6">
            {v.compareData.insufficientData.length > 0 && (
              <p className="text-sm text-amber-600">
                Недостаточно данных для: {v.compareData.insufficientData.join(", ")}
              </p>
            )}
            <CompareLinearChart coins={v.compareData.coins} />
            {v.compareData.coins.some((c) => c.boxPlot !== null) && (
              <CompareBoxPlotChart coins={v.compareData.coins} />
            )}
          </div>
        )}
      </section>
    </AppPageShell>
  );
}
