import { AppPageShell } from "@/components/app-page-shell";
import { SearchableCoinListTemplate } from "@/components/coins/searchable-coin-list-template";
import { useFavoritesView } from "@/hooks/favorites-view/use-favorites-view";

export default function FavoritesPage() {
  const viewState = useFavoritesView();

  return (
    <AppPageShell
      activeSection="favorites"
      headTitle="Избранное | CryptoWatch"
      headDescription="Страница избранных монет"
      title="Избранные монеты"
      description="Фильтры, сортировка и список"
    >
      <SearchableCoinListTemplate filters={viewState.filters} table={viewState.table} />
    </AppPageShell>
  );
}
