import { CoinTable } from "@/components/coin-table";
import { ViewStateSection } from "@/components/view-state-section";
import type { CoinTableSortKey, CoinTableSortState, WatchlistCoin } from "@/types/coins";
import type { CoinTableAction } from "@/types/ui";
import type { ViewStatus } from "@/types/view-state";

interface CoinTableSectionProps {
  sectionLabel: string;
  title: string;
  status: ViewStatus;
  errorTitle: string;
  errorMessage: string;
  onRetry: () => void;
  coins: WatchlistCoin[];
  totalLabel: string;
  onToggleFavorite?: (coin: WatchlistCoin) => void;
  getFavoriteActionLabel?: (coin: WatchlistCoin) => string;
  isFavoriteActionPending?: (coin: WatchlistCoin) => boolean;
  actions?: CoinTableAction[];
  sort?: CoinTableSortState | null;
  onSortChange?: (key: CoinTableSortKey) => void;
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
  onToggleFavorite,
  getFavoriteActionLabel,
  isFavoriteActionPending,
  actions,
  sort,
  onSortChange,
  emptyTitle,
  emptyMessage,
  emptyActionLabel,
  onEmptyAction
}: CoinTableSectionProps) => {
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
        <>
          <CoinTable
            coins={coins}
            onToggleFavorite={onToggleFavorite}
            getFavoriteActionLabel={getFavoriteActionLabel}
            isFavoriteActionPending={isFavoriteActionPending}
            actions={actions}
            sort={sort}
            onSortChange={onSortChange}
          />

          <div className="cw-pagination">
            <span>{totalLabel}</span>
          </div>
        </>
      </ViewStateSection>
    </div>
  );
};
