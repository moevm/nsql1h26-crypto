import { ReactNode } from "react";

import { RangeField } from "@/components/range-field";

interface CoinFiltersPanelProps {
  sectionLabel: string;
  title: string;
  queryId: string;
  queryName: string;
  queryLabel: string;
  queryPlaceholder: string;
  rangeIdPrefix: string;
  children?: ReactNode;
}

export const CoinFiltersPanel = ({
  sectionLabel,
  title,
  queryId,
  queryName,
  queryLabel,
  queryPlaceholder,
  rangeIdPrefix,
  children
}: CoinFiltersPanelProps) => {
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
          />
        </div>

        <div className="cw-filter-grid mt-6">
          <RangeField id={`${rangeIdPrefix}-price`} label="Цена, USD" inputType="number" />
          <RangeField
            id={`${rangeIdPrefix}-cap`}
            label="Капитализация"
            inputType="number"
          />
          <RangeField
            id={`${rangeIdPrefix}-change`}
            label="Изменение за 24ч"
            inputType="number"
          />
          <RangeField id={`${rangeIdPrefix}-volume`} label="Объем торгов" inputType="number" />
          {children}
        </div>
      </div>
    </div>
  );
};
