import ReactECharts from "echarts-for-react";
import { useMemo } from "react";

import type { CompareCoinData } from "@/types/coins";
import { GRID, MUTED, TEXT, TOOLTIP_BG, TOOLTIP_BORDER } from "@/utils/chart-theme";

const COIN_COLORS = ["#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2", "#be185d"];

interface CompareBoxPlotChartProps {
  coins: CompareCoinData[];
}

const computeBoxStats = (coin: CompareCoinData): number[] | null => {
  if (coin.linearSeries.length < 2) return null;
  const vals = [...coin.linearSeries.map((p) => p.pctFromStart)].sort((a, b) => a - b);
  const n = vals.length;
  const percentile = (p: number) => {
    const idx = (p / 100) * (n - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return lo === hi ? vals[lo] : vals[lo] * (hi - idx) + vals[hi] * (idx - lo);
  };
  return [vals[0], percentile(25), percentile(50), percentile(75), vals[n - 1]];
};

const fmtPct = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;

export const CompareBoxPlotChart = ({ coins }: CompareBoxPlotChartProps) => {
  const option = useMemo(() => {
    const items = coins
      .map((coin, i) => ({ coin, stats: computeBoxStats(coin), color: COIN_COLORS[i % COIN_COLORS.length] }))
      .filter((x): x is { coin: CompareCoinData; stats: number[]; color: string } => x.stats !== null);

    return {
      tooltip: {
        trigger: "item",
        backgroundColor: TOOLTIP_BG,
        borderColor: TOOLTIP_BORDER,
        textStyle: { color: TEXT, fontSize: 12 },
        formatter: (params: { name: string; value: number[] }) => {
          const [min, q1, median, q3, max] = params.value;
          return [
            `<b>${params.name}</b>`,
            `Макс: ${fmtPct(max)}`,
            `Q3: ${fmtPct(q3)}`,
            `Медиана: ${fmtPct(median)}`,
            `Q1: ${fmtPct(q1)}`,
            `Мин: ${fmtPct(min)}`
          ].join("<br/>");
        }
      },
      grid: { left: 72, right: 16, top: 16, bottom: 32 },
      xAxis: {
        type: "category",
        data: items.map((x) => x.coin.symbol),
        axisLine: { lineStyle: { color: GRID } },
        axisLabel: { color: TEXT, fontSize: 13, fontWeight: "bold" }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: MUTED, fontSize: 11, formatter: fmtPct },
        splitLine: { lineStyle: { color: GRID } }
      },
      series: [
        {
          type: "boxplot",
          data: items.map((x) => ({
            value: x.stats,
            itemStyle: { color: `${x.color}22`, borderColor: x.color, borderWidth: 2 }
          }))
        }
      ]
    };
  }, [coins]);

  return (
    <section className="cw-surface-soft">
      <p className="cw-kicker mb-4">Распределение изменения цены за период (Box Plot, % от старта)</p>
      <div className="h-72 w-full">
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
      </div>
    </section>
  );
};
