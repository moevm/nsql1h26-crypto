import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import type { AppSection } from "@/types/ui";
import { appNavItems } from "@/utils/app-navigation";

interface AppNavigationProps {
  activeSection: AppSection;
}

export const AppNavigation = ({ activeSection }: AppNavigationProps) => {
  const { session } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuId = useId();
  const visibleItems = appNavItems.filter((item) => {
    if (item.requiredRole && item.requiredRole !== session?.role) {
      return false;
    }

    return true;
  });

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="cw-app-nav">
      <nav className="hidden flex-wrap gap-2 lg:flex" aria-label="Основная навигация">
        {visibleItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`cw-app-nav-link ${
              item.key === activeSection ? "cw-app-nav-link-active" : ""
            }`}
            aria-current={item.key === activeSection ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="lg:hidden">
        <button
          type="button"
          className="cw-button-secondary cw-app-nav-toggle"
          onClick={() => setIsMobileMenuOpen((currentState) => !currentState)}
          aria-expanded={isMobileMenuOpen}
          aria-controls={mobileMenuId}
          aria-label={isMobileMenuOpen ? "Закрыть мобильное меню" : "Открыть мобильное меню"}
        >
          {isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
        </button>
      </div>

      {isMobileMenuOpen ? (
        <>
          <button
            type="button"
            className="cw-app-nav-overlay lg:hidden"
            aria-label="Закрыть мобильное меню"
            onClick={closeMobileMenu}
          />
          <nav
            id={mobileMenuId}
            className="cw-app-nav-mobile lg:hidden"
            aria-label="Мобильная навигация"
          >
            {visibleItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`cw-app-nav-link ${
                  item.key === activeSection ? "cw-app-nav-link-active" : ""
                }`}
                aria-current={item.key === activeSection ? "page" : undefined}
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </>
      ) : null}
    </div>
  );
};
