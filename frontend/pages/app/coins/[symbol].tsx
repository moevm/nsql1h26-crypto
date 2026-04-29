import { AppPageShell } from "@/components/app-page-shell";
import { CoinHistorySection } from "@/components/coin-details/coin-history-section";
import { CoinSummaryCard } from "@/components/coin-details/coin-summary-card";
import { EmptyState } from "@/components/view-state/empty-state";
import { ErrorState } from "@/components/view-state/error-state";
import { LoadingState } from "@/components/view-state/loading-state";
import { useCoinHistoryView } from "@/hooks/coin-details-view/use-coin-history-view";
import { useCoinDetailsView } from "@/hooks/coin-details-view/use-coin-details-view";

export default function CoinDetailsPage() {
  const viewState = useCoinDetailsView();
  const historyViewState = useCoinHistoryView();
  const symbolLabel = viewState.symbol || "...";

  return (
    <AppPageShell
      activeSection="coins"
      headTitle={viewState.headTitle}
      headDescription={viewState.headDescription}
      title={viewState.pageTitle}
      description={viewState.pageDescription}
    >
      <section className="mt-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <button className="cw-button-secondary" type="button" onClick={viewState.goBack}>
            Назад
          </button>

          <span className="cw-auth-badge" translate="no">
            {symbolLabel}
          </span>
        </div>

        {viewState.status === "loading" ? (
          <LoadingState
            title="Загружаем монету..."
            message="Получаем данные и подготавливаем экран"
          />
        ) : null}

        {viewState.status === "notFound" ? (
          <EmptyState
            title="Монета не найдена"
            message="Проверьте тикер или вернитесь к списку монет"
            actionLabel="Назад"
            onAction={viewState.goBack}
          />
        ) : null}

        {viewState.status === "error" ? (
          <ErrorState
            title="Не удалось открыть страницу монеты"
            message={viewState.errorMessage}
            onAction={() => {
              void viewState.retry();
            }}
          />
        ) : null}

        {viewState.status === "ready" && viewState.coinDetails ? (
          <>
            <CoinSummaryCard
              coinDetails={viewState.coinDetails}
              isFavoritePending={viewState.isFavoritePending}
              onToggleFavorite={() => {
                void viewState.toggleFavorite();
              }}
            />

            <CoinHistorySection viewState={historyViewState} />
          </>
        ) : null}
      </section>
    </AppPageShell>
  );
}
