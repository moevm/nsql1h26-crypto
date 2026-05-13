import type { ReactNode } from "react";

import { CoinFiltersPanel } from "@/components/coins/coin-filters-panel";
import { CoinTableSection } from "@/components/coins/coin-table-section";
import type { ViewStatus } from "@/types/status";
import type {
  CoinFilterRangeEdge,
  CoinFilterRangeKey,
  CoinFilterRangesState,
  CoinTableSortKey,
  CoinTableSortState,
  WatchlistCoin
} from "@/types/coins";
import type { CoinTableAction, CoinTablePagination } from "@/types/coin-table";

export interface SearchableCoinListTemplateFiltersProps {
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
  showOnlyFavoritesField?: boolean;
  onlyFavoritesValue?: boolean;
  onOnlyFavoritesChange?: (value: boolean) => void;
  ranges: CoinFilterRangesState;
  onRangeChange: (key: CoinFilterRangeKey, edge: CoinFilterRangeEdge, value: string) => void;
  helperText?: string;
  validationMessage?: string | null;
  onApply?: () => void;
  onReset?: () => void;
  isApplyDisabled?: boolean;
  isApplyPending?: boolean;
  isResetDisabled?: boolean;
  footerActions?: ReactNode;
}

export interface SearchableCoinListTemplateTableProps {
  sectionLabel: string;
  title: string;
  status: ViewStatus;
  errorTitle: string;
  errorMessage: string;
  onRetry: () => void;
  coins: WatchlistCoin[];
  totalLabel: string;
  getCoinHref?: (coin: WatchlistCoin) => string;
  onToggleFavorite?: (coin: WatchlistCoin) => void | Promise<void>;
  getFavoriteActionLabel?: (coin: WatchlistCoin) => string;
  isFavoriteActionPending?: (coin: WatchlistCoin) => boolean;
  actions?: CoinTableAction[];
  sort?: CoinTableSortState | null;
  onSortChange?: (key: CoinTableSortKey) => void;
  sortableColumns?: readonly CoinTableSortKey[];
  pagination?: CoinTablePagination;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
}

interface SearchableCoinListTemplateProps {
  toolbar?: ReactNode;
  filters: SearchableCoinListTemplateFiltersProps;
  table: SearchableCoinListTemplateTableProps;
}

const buildFiltersFooter = (filters: SearchableCoinListTemplateFiltersProps): ReactNode => {
  const hasActions =
    filters.onApply !== undefined || filters.onReset !== undefined || filters.footerActions !== undefined;
  const helperCopy = filters.validationMessage ?? filters.helperText;
  const helperClassName = filters.validationMessage ? "cw-negative" : "text-text-muted";

  if (!helperCopy && !hasActions) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {helperCopy ? <p className={`text-sm ${helperClassName}`}>{helperCopy}</p> : <span />}
      {hasActions ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {filters.footerActions}
          {filters.onReset ? (
            <button
              className="cw-button-secondary"
              type="button"
              onClick={filters.onReset}
              disabled={filters.isResetDisabled || filters.isApplyPending}
            >
              Сбросить
            </button>
          ) : null}
          {filters.onApply ? (
            <button
              className="cw-button-primary"
              type="button"
              onClick={filters.onApply}
              disabled={filters.isApplyDisabled}
            >
              {filters.isApplyPending ? "Применяем..." : "Применить"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export const SearchableCoinListTemplate = ({
  toolbar,
  filters,
  table
}: SearchableCoinListTemplateProps) => {
  return (
    <section className="mt-8 space-y-6">
      {toolbar}

      <CoinFiltersPanel
        sectionLabel={filters.sectionLabel}
        title={filters.title}
        showQueryField={filters.showQueryField}
        queryId={filters.queryId}
        queryName={filters.queryName}
        queryLabel={filters.queryLabel}
        queryPlaceholder={filters.queryPlaceholder}
        rangeIdPrefix={filters.rangeIdPrefix}
        queryValue={filters.queryValue}
        onQueryChange={filters.onQueryChange}
        showOnlyFavoritesField={filters.showOnlyFavoritesField}
        onlyFavoritesValue={filters.onlyFavoritesValue}
        onOnlyFavoritesChange={filters.onOnlyFavoritesChange}
        ranges={filters.ranges}
        onRangeChange={filters.onRangeChange}
        footer={buildFiltersFooter(filters)}
      />

      <CoinTableSection
        sectionLabel={table.sectionLabel}
        title={table.title}
        status={table.status}
        errorTitle={table.errorTitle}
        errorMessage={table.errorMessage}
        onRetry={table.onRetry}
        coins={table.coins}
        totalLabel={table.totalLabel}
        getCoinHref={table.getCoinHref}
        onToggleFavorite={table.onToggleFavorite}
        getFavoriteActionLabel={table.getFavoriteActionLabel}
        isFavoriteActionPending={table.isFavoriteActionPending}
        actions={table.actions}
        sort={table.sort}
        onSortChange={table.onSortChange}
        sortableColumns={table.sortableColumns}
        pagination={table.pagination}
        emptyTitle={table.emptyTitle}
        emptyMessage={table.emptyMessage}
        emptyActionLabel={table.emptyActionLabel}
        onEmptyAction={table.onEmptyAction}
      />
    </section>
  );
};
