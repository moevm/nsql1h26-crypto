import { PropsWithChildren } from "react";

import type { AppSection } from "@/types/ui";
import { appNavItems } from "@/utils/app-navigation";

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
              <nav className="flex flex-wrap gap-2" aria-label="Основная навигация">
                {appNavItems.map((item) => (
                  <span
                    key={item.key}
                    className={`cw-app-nav-link ${
                      item.key === activeSection ? "cw-app-nav-link-active" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                ))}
              </nav>
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
