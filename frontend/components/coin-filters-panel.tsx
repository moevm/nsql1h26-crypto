import type { ChangeEvent, ReactNode } from "react";

import { RangeField } from "@/components/range-field";

interface RangeFieldControl {
  startValue?: string;
  endValue?: string;
  onStartChange?: (value: string) => void;
  onEndChange?: (value: string) => void;
}

interface CoinFiltersPanelProps {
  sectionLabel: string;
  title: string;
  queryId: string;
  queryName: string;
  queryLabel: string;
  queryPlaceholder: string;
  rangeIdPrefix: string;
  queryValue?: string;
  onQueryChange?: (value: string) => void;
  priceRange?: RangeFieldControl;
  capRange?: RangeFieldControl;
  changeRange?: RangeFieldControl;
  volumeRange?: RangeFieldControl;
  children?: ReactNode;
  footer?: ReactNode;
}

export const CoinFiltersPanel = ({
  sectionLabel,
  title,
  queryId,
  queryName,
  queryLabel,
  queryPlaceholder,
  rangeIdPrefix,
  queryValue,
  onQueryChange,
  priceRange,
  capRange,
  changeRange,
  volumeRange,
  children,
  footer
}: CoinFiltersPanelProps) => {
  const queryControlProps = onQueryChange
    ? {
        value: queryValue ?? "",
        onChange: (event: ChangeEvent<HTMLInputElement>) => onQueryChange(event.target.value)
      }
    : {};

  return (
    <div>
      <div className="cw-section-label">{sectionLabel}</div>
      <div className="cw-panel-muted">
        <h2 className="cw-card-title">{title}</h2>

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

        <div className="cw-filter-grid mt-6">
          <RangeField
            id={`${rangeIdPrefix}-price`}
            label="Цена, USD"
            inputType="number"
            {...priceRange}
          />
          <RangeField
            id={`${rangeIdPrefix}-cap`}
            label="Капитализация"
            inputType="number"
            {...capRange}
          />
          <RangeField
            id={`${rangeIdPrefix}-change`}
            label="Изменение за 24ч"
            inputType="number"
            {...changeRange}
          />
          <RangeField
            id={`${rangeIdPrefix}-volume`}
            label="Объем торгов"
            inputType="number"
            {...volumeRange}
          />
          {children}
        </div>

        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </div>
  );
};
