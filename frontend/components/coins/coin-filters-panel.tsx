import type { ChangeEvent, ReactNode } from "react";

import { RangeField } from "@/components/coins/range-field";
import type { CoinFilterRangeKey, CoinFilterRangeValue } from "@/types/coins";

type RangeFieldEdge = "start" | "end";

const COIN_FILTER_FIELDS: Array<{
  key: CoinFilterRangeKey;
  idSuffix: string;
  label: string;
}> = [
  { key: "price", idSuffix: "price", label: "Цена, USD" },
  { key: "cap", idSuffix: "cap", label: "Капитализация" },
  { key: "change", idSuffix: "change", label: "Изменение за 24ч" },
  { key: "volume", idSuffix: "volume", label: "Объем торгов" }
];

interface CoinFiltersPanelProps {
  sectionLabel: string;
  title: string;
  showQueryField?: boolean;
  queryId?: string;
  queryName?: string;
  queryLabel?: string;
  queryPlaceholder?: string;
  rangeIdPrefix: string;
  queryValue?: string;
  onQueryChange?: (value: string) => void;
  ranges?: Partial<Record<CoinFilterRangeKey, CoinFilterRangeValue>>;
  onRangeChange?: (key: CoinFilterRangeKey, edge: RangeFieldEdge, value: string) => void;
  children?: ReactNode;
  footer?: ReactNode;
}

export const CoinFiltersPanel = ({
  sectionLabel,
  title,
  showQueryField = true,
  queryId,
  queryName,
  queryLabel,
  queryPlaceholder,
  rangeIdPrefix,
  queryValue,
  onQueryChange,
  ranges,
  onRangeChange,
  children,
  footer
}: CoinFiltersPanelProps) => {
  const queryControlProps = onQueryChange
    ? {
        value: queryValue ?? "",
        onChange: (event: ChangeEvent<HTMLInputElement>) => onQueryChange(event.target.value)
      }
    : {};
  const shouldShowQueryField =
    showQueryField &&
    queryId !== undefined &&
    queryName !== undefined &&
    queryLabel !== undefined &&
    queryPlaceholder !== undefined;

  return (
    <div>
      <div className="cw-section-label">{sectionLabel}</div>
      <div className="cw-panel-muted">
        <h2 className="cw-card-title">{title}</h2>

        {shouldShowQueryField ? (
          <div className="mt-6">
            <label className="cw-field-label" htmlFor={queryId}>
              {queryLabel}
            </label>
            <input
              autoComplete="off"
              className="cw-input"
              id={queryId}
              name={queryName}
              placeholder={queryPlaceholder}
              type="search"
              {...queryControlProps}
            />
          </div>
        ) : null}

        <div className="cw-filter-grid mt-6">
          {COIN_FILTER_FIELDS.map((field) => (
            <RangeField
              key={field.key}
              id={`${rangeIdPrefix}-${field.idSuffix}`}
              label={field.label}
              inputType="number"
              startValue={ranges?.[field.key]?.start}
              endValue={ranges?.[field.key]?.end}
              onStartChange={
                onRangeChange
                  ? (value) => onRangeChange(field.key, "start", value)
                  : undefined
              }
              onEndChange={
                onRangeChange
                  ? (value) => onRangeChange(field.key, "end", value)
                  : undefined
              }
            />
          ))}
          {children}
        </div>

        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </div>
  );
};
