import ReactECharts from "echarts-for-react";
import { useMemo } from "react";

import type { CompareCoinData } from "@/types/coins";
import {
  GRID,
  MUTED,
  TEXT,
  TOOLTIP_BG,
  TOOLTIP_BORDER,
  defaultDataZoom,
  tickFormatter
} from "@/utils/chart-theme";

const COIN_COLORS = ["#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2", "#be185d"];

interface CompareLinearChartProps {
  coins: CompareCoinData[];
}

export const CompareLinearChart = ({ coins }: CompareLinearChartProps) => {
  const option = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        backgroundColor: TOOLTIP_BG,
        borderColor: TOOLTIP_BORDER,
        textStyle: { color: TEXT, fontSize: 12 },
        formatter: (params: { seriesName: string; value: [number, number]; color: string }[]) => {
          const date = tickFormatter.format(new Date(params[0].value[0]));
          const lines = params
            .map((s) => {
              const sign = s.value[1] >= 0 ? "+" : "";
              return `<span style="color:${s.color}">●</span> ${s.seriesName}: ${sign}${s.value[1].toFixed(2)}%`;
            })
            .join("<br/>");
          return `${lines}<br/><small style="color:${MUTED}">${date}</small>`;
        }
      },
      legend: { data: coins.map((c) => c.symbol), textStyle: { color: TEXT, fontSize: 12 }, top: 0 },
      grid: { left: 60, right: 16, top: 36, bottom: 48 },
      xAxis: {
        type: "time",
        axisLine: { lineStyle: { color: GRID } },
        axisLabel: { color: MUTED, fontSize: 11, formatter: (v: number) => tickFormatter.format(new Date(v)) }
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: MUTED,
          fontSize: 11,
          formatter: (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`
        },
        splitLine: { lineStyle: { color: GRID } }
      },
      dataZoom: defaultDataZoom,
      series: coins.map((coin, i) => ({
        name: coin.symbol,
        type: "line",
        data: coin.linearSeries.map((p) => [new Date(p.timestamp).getTime(), p.pctFromStart]),
        smooth: true,
        symbol: "none",
        lineStyle: { color: COIN_COLORS[i % COIN_COLORS.length], width: 2 },
        itemStyle: { color: COIN_COLORS[i % COIN_COLORS.length] }
      }))
    }),
    [coins]
  );

  return (
    <section className="cw-surface-soft">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <p className="cw-kicker">Динамика цены (% от начала периода)</p>
        <p className="text-xs text-muted-foreground">Клик по монете в легенде — скрыть/показать</p>
      </div>
      <div className="h-80 w-full">
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
      </div>
    </section>
  );
};
