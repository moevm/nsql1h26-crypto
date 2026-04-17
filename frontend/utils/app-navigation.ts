import type { AppNavItem } from "@/types/ui";

export const appNavItems: AppNavItem[] = [
  { key: "coins", label: "Монеты", href: "/app" },
  { key: "favorites", label: "Избранное", href: "/app/favorites" },
  { key: "statistics", label: "Статистика", href: "/app/statistics" },
  {
    key: "importExport",
    label: "Импорт / экспорт",
    href: "/app/admin/import-export",
    requiredRole: "ROLE_ADMIN"
  }
];
