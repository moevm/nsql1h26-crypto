import { PropsWithChildren } from "react";

import { AppNavigation } from "@/components/app-navigation";
import type { AppSection } from "@/types/ui";

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
            <div className="cw-app-header-row">
              <p className="cw-kicker mb-0">CryptoWatch</p>
              <AppNavigation activeSection={activeSection} />
            </div>
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
