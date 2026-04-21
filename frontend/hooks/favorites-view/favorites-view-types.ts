import type {
  SearchableCoinListTemplateFiltersProps,
  SearchableCoinListTemplateTableProps
} from "@/components/coins/searchable-coin-list-template";

export interface UseFavoritesViewResult {
  filters: SearchableCoinListTemplateFiltersProps;
  table: SearchableCoinListTemplateTableProps;
}
