import { AUTH_ROLES } from "@/services/auth/auth-roles";
import type { AppNavItem } from "@/types/app-navigation";

export const appNavItems: AppNavItem[] = [
  { key: "coins", label: "Монеты", href: "/app" },
  { key: "favorites", label: "Избранное", href: "/app/favorites" },
  { key: "statistics", label: "Статистика", href: "/app/statistics" },
  {
    key: "importExport",
    label: "Импорт / экспорт",
    href: "/app/admin/import-export",
    requiredRole: AUTH_ROLES.ADMIN
  }
];
