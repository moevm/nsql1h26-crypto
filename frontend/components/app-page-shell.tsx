import { PropsWithChildren } from "react";

import { AppLayout } from "@/components/app-layout";
import { PageHead } from "@/components/page-head";
import { ProtectedPage } from "@/components/protected-page";
import type { AuthRole } from "@/types/auth";
import type { AppSection } from "@/types/ui";

interface AppPageShellProps extends PropsWithChildren {
  activeSection: AppSection;
  headTitle: string;
  headDescription: string;
  title: string;
  description: string;
  requiredRole?: AuthRole;
}

export const AppPageShell = ({
  children,
  activeSection,
  headTitle,
  headDescription,
  title,
  description,
  requiredRole
}: AppPageShellProps) => {
  return (
    <ProtectedPage requiredRole={requiredRole}>
      <PageHead title={headTitle} description={headDescription} />
      <AppLayout activeSection={activeSection} title={title} description={description}>
        {children}
      </AppLayout>
    </ProtectedPage>
  );
};
