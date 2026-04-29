import { PropsWithChildren } from "react";

import { AppHeaderActions } from "@/components/app-header-actions";
import type { AppSection } from "@/types/app-navigation";

interface AppLayoutProps extends PropsWithChildren {
  activeSection: AppSection;
  title: string;
  description: string;
}

export const AppLayout = ({
  children,
  activeSection,
  title,
  description
}: AppLayoutProps) => {
  return (
    <div className="cw-app-shell">
      <div className="cw-app-frame">
        <header className="cw-surface overflow-hidden">
          <div className="cw-app-header-bar">
            <AppHeaderActions activeSection={activeSection} />
          </div>

          <div className="cw-app-header-copy">
            <h1 className="cw-section-title">{title}</h1>
            <p className="cw-auth-copy mt-3 max-w-2xl text-sm leading-7 sm:text-base">
              {description}
            </p>
          </div>
        </header>

        <main className="cw-surface cw-app-content">{children}</main>
      </div>
    </div>
  );
};
