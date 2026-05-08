import { useCoinListRouteState } from "@/hooks/coin-list-route/use-coin-list-route-state";
import type { CoinListPageModeConfig } from "@/hooks/coin-list-route/coin-list-route-config";
import type { CoinTableSortKey } from "@/types/coins";

interface SearchableCoinListQueryFieldConfig {
  id: string;
  name: string;
  label: string;
  placeholder: string;
}

interface UseSearchableCoinListTemplateOptions {
  routeConfig: CoinListPageModeConfig;
  rangeIdPrefix: string;
  queryField?: SearchableCoinListQueryFieldConfig;
  filterHelperText: string;
}

export const useSearchableCoinListTemplate = (
  options: UseSearchableCoinListTemplateOptions
) => {
  if (options.routeConfig.supportsTextQuery && !options.queryField) {
    throw new Error("Searchable coin list template requires queryField for text-search mode");
  }

  const routeState = useCoinListRouteState(options.routeConfig);

  return {
    routeState,
    filterPanelProps: {
      showQueryField: options.routeConfig.supportsTextQuery,
      queryId: options.queryField?.id,
      queryName: options.queryField?.name,
      queryLabel: options.queryField?.label,
      queryPlaceholder: options.queryField?.placeholder,
      rangeIdPrefix: options.rangeIdPrefix,
      queryValue: routeState.draftState.query,
      onQueryChange: routeState.setDraftQuery,
      ranges: routeState.draftState.ranges,
      onRangeChange: routeState.setDraftRangeValue,
      helperText: options.filterHelperText,
      validationMessage: routeState.rangeValidationMessage,
      onApply: routeState.applyDraft,
      onReset: routeState.resetDraft,
      isApplyDisabled:
        !routeState.hasPendingDraftChanges ||
        Boolean(routeState.rangeValidationMessage) ||
        routeState.isRouteTransitionPending,
      isApplyPending: routeState.isRouteTransitionPending,
      isResetDisabled:
        !routeState.hasActiveDraftFilters && !routeState.hasPendingDraftChanges
    },
    tableState: {
      sort: routeState.appliedState.sort,
      onSortChange: (key: CoinTableSortKey) => {
        if (options.routeConfig.allowedSortKeys.includes(key as (typeof options.routeConfig.allowedSortKeys)[number])) {
          routeState.requestSort(key as (typeof options.routeConfig.allowedSortKeys)[number]);
        }
      },
      sortableColumns: options.routeConfig.allowedSortKeys
    }
  };
};
