import { EmptyState } from "@/components/empty-state";
import { PropsWithChildren } from "react";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import type { ViewStatus } from "@/types/view-state";

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
  if (status === "loading") {
    return <LoadingState title={loadingTitle} message={loadingMessage} />;
  }

  if (status === "empty") {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  if (status === "error") {
    return <ErrorState title={errorTitle} message={errorMessage} onAction={onRetry} />;
  }

  return <>{children}</>;
};
