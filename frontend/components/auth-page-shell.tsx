import { PropsWithChildren } from "react";

import { AuthLayout } from "@/components/auth-layout";
import { LoadingState } from "@/components/loading-state";
import { PageHead } from "@/components/page-head";

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
