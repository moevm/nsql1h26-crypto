import { PropsWithChildren } from "react";

import { AuthLayout } from "@/components/auth-layout";
import { PageHead } from "@/components/page-head";
import { LoadingState } from "@/components/view-state/loading-state";

interface AuthPageShellProps extends PropsWithChildren {
  isReady: boolean;
  headTitle: string;
  headDescription: string;
  eyebrow: string;
  title: string;
  description: string;
}

export const AuthPageShell = ({
  children,
  isReady,
  headTitle,
  headDescription,
  eyebrow,
  title,
  description
}: AuthPageShellProps) => {
  if (!isReady) {
    return (
      <LoadingState
        title="Проверяем доступ"
        message="Открываем приложение"
      />
    );
  }

  return (
    <>
      <PageHead title={headTitle} description={headDescription} />
      <AuthLayout eyebrow={eyebrow} title={title} description={description}>
        {children}
      </AuthLayout>
    </>
  );
};
