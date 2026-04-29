import { CoinTable } from "@/components/coins/coin-table";
import { ViewStateSection } from "@/components/view-state/view-state-section";
import type { CoinTableSortKey, CoinTableSortState, WatchlistCoin } from "@/types/coins";
import type { CoinTableAction, CoinTablePagination } from "@/types/coin-table";
import type { ViewStatus } from "@/types/status";

interface CoinTableSectionProps {
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

export const CoinTableSection = ({
  sectionLabel,
  title,
  status,
  errorTitle,
  errorMessage,
  onRetry,
  coins,
  totalLabel,
  getCoinHref,
  onToggleFavorite,
  getFavoriteActionLabel,
  isFavoriteActionPending,
  actions,
  sort,
  onSortChange,
  sortableColumns,
  pagination,
  emptyTitle,
  emptyMessage,
  emptyActionLabel,
  onEmptyAction
}: CoinTableSectionProps) => {
  const paginationControls = pagination ? (
    <div className="flex items-center gap-3">
      <button
        className="cw-button-secondary"
        type="button"
        onClick={pagination.onPrevious}
        disabled={!pagination.canGoPrevious || pagination.isPending}
        aria-label="Предыдущая страница"
      >
        Назад
      </button>

      <span className="text-sm text-text-muted">
        Страница {pagination.currentPage} из {pagination.totalPages}
      </span>

      <button
        className="cw-button-secondary"
        type="button"
        onClick={pagination.onNext}
        disabled={!pagination.canGoNext || pagination.isPending}
        aria-label="Следующая страница"
      >
        Вперёд
      </button>
    </div>
  ) : null;

  return (
    <div>
      <div className="cw-section-label">{sectionLabel}</div>
      <div className="mb-4">
        <h2 className="cw-card-title">{title}</h2>
      </div>

      <ViewStateSection
        status={status}
        errorTitle={errorTitle}
        errorMessage={errorMessage}
        onRetry={onRetry}
        emptyTitle={emptyTitle}
        emptyMessage={emptyMessage}
        emptyActionLabel={emptyActionLabel}
        onEmptyAction={onEmptyAction}
      >
        <div>
          <CoinTable
            coins={coins}
            getCoinHref={getCoinHref}
            onToggleFavorite={onToggleFavorite}
            getFavoriteActionLabel={getFavoriteActionLabel}
            isFavoriteActionPending={isFavoriteActionPending}
            actions={actions}
            sort={sort}
            onSortChange={onSortChange}
            sortableColumns={sortableColumns}
          />

          <div className="cw-pagination gap-4">
            <span>{totalLabel}</span>
            {paginationControls}
          </div>
        </div>
      </ViewStateSection>
    </div>
  );
};
