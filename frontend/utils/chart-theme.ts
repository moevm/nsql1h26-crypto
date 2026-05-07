export const BRAND = "#7c3aed";
export const MUTED = "#9ca3af";
export const TEXT = "#4b5563";
export const GRID = "rgba(209, 213, 219, 0.6)";
export const TOOLTIP_BG = "rgba(255, 255, 255, 0.96)";
export const TOOLTIP_BORDER = "rgba(229, 231, 235, 0.9)";
export const FILTERED_OUT = "#d1d5db";

// Color palette for multiple series
export const CHART_COLORS = [
  "#7c3aed", // Purple (brand)
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#3b82f6", // Blue
];

export const tickFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" });

export const defaultDataZoom = [
  {
    type: "slider" as const,
    height: 20,
    bottom: 4,
    minSpan: 5,
    borderColor: "transparent",
    fillerColor: "rgba(124, 58, 237, 0.08)",
    handleStyle: { color: BRAND },
    moveHandleStyle: { color: BRAND },
    textStyle: { color: MUTED, fontSize: 11 }
  },
  { type: "inside" as const, minSpan: 5 }
];
