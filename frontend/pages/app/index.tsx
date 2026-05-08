import { useRef, useState } from "react";

import { AppPageShell } from "@/components/app-page-shell";
import { AddCoinModal } from "@/components/coins/add-coin-modal";
import { SearchableCoinListTemplate } from "@/components/coins/searchable-coin-list-template";
import { useAddCoinFlow } from "@/hooks/watchlist-view/use-add-coin-flow";
import { useWatchlistView } from "@/hooks/watchlist-view/use-watchlist-view";

const AppHomePageContent = () => {
  const viewState = useWatchlistView();
  const addCoinFlow = useAddCoinFlow({
    reloadWatchlist: viewState.reloadWatchlist
  });
  const [isAddCoinModalOpen, setIsAddCoinModalOpen] = useState(false);
  const addCoinButtonRef = useRef<HTMLButtonElement>(null);

  const openAddCoinModal = () => {
    setIsAddCoinModalOpen(true);
  };

  const closeAddCoinModal = () => {
    setIsAddCoinModalOpen(false);
  };

  return (
    <>
      <AppPageShell
        activeSection="coins"
        headTitle="Монеты | CryptoWatch"
        headDescription="Главная страница watchlist"
        title="Список отслеживаемых монет"
        description="Поиск, фильтр, таблица"
      >
        <SearchableCoinListTemplate
          toolbar={
            <section className="cw-toolbar">
              <div className="cw-toolbar-actions">
                <button
                  ref={addCoinButtonRef}
                  className="cw-button-primary"
                  type="button"
                  onClick={openAddCoinModal}
                >
                  Добавить монету
                </button>
                <button
                  className="cw-button-secondary"
                  type="button"
                  onClick={() => void viewState.refreshWatchlist()}
                  disabled={viewState.isRefreshPending}
                >
                  {viewState.isRefreshPending ? "Обновляем..." : "Обновить"}
                </button>
              </div>
            </section>
          }
          filters={viewState.filters}
          table={{
            ...viewState.table,
            onEmptyAction: viewState.table.onEmptyAction ?? openAddCoinModal
          }}
        />
      </AppPageShell>

      <AddCoinModal
        open={isAddCoinModalOpen}
        onClose={closeAddCoinModal}
        isSubmitting={addCoinFlow.isSubmitting}
        onSubmit={addCoinFlow.submitCoin}
        restoreFocusRef={addCoinButtonRef}
      />
    </>
  );
};

export default function AppHomePage() {
  return <AppHomePageContent />;
}
