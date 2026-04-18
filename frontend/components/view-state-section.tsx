import { EmptyState } from "@/components/empty-state";
import { PropsWithChildren } from "react";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { VIEW_STATUS, type ViewStatus } from "@/types/status";

interface ViewStateSectionProps extends PropsWithChildren {
  status: ViewStatus;
  loadingTitle?: string;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  errorTitle: string;
  errorMessage: string;
  onRetry: () => void;
}

export const ViewStateSection = ({
  status,
  loadingTitle,
  loadingMessage,
  emptyTitle = "Нет данных",
  emptyMessage = "Пока нечего показать",
  emptyActionLabel,
  onEmptyAction,
  errorTitle,
  errorMessage,
  onRetry,
  children
}: ViewStateSectionProps) => {
  if (status === VIEW_STATUS.LOADING) {
    return <LoadingState title={loadingTitle} message={loadingMessage} />;
  }

  if (status === VIEW_STATUS.EMPTY) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  if (status === VIEW_STATUS.ERROR) {
    return <ErrorState title={errorTitle} message={errorMessage} onAction={onRetry} />;
  }

  return <>{children}</>;
};
