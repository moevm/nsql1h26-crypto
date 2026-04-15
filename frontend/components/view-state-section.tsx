import { PropsWithChildren } from "react";

import { ErrorState } from "@/components/error-state";
import type { ViewStatus } from "@/types/view-state";

interface ViewStateSectionProps extends PropsWithChildren {
  status: ViewStatus;
  errorTitle: string;
  errorMessage: string;
  onRetry: () => void;
}

export const ViewStateSection = ({
  status,
  errorTitle,
  errorMessage,
  onRetry,
  children
}: ViewStateSectionProps) => {
  return status === "error" ? (
    <ErrorState title={errorTitle} message={errorMessage} onAction={onRetry} />
  ) : (
    <>{children}</>
  );
};
