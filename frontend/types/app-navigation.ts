import type { AuthRole } from "@/types/auth";

export type AppSection = "coins" | "favorites" | "statistics" | "importExport";

export interface AppNavItem {
  key: AppSection;
  label: string;
  href: string;
  requiredRole?: AuthRole;
}
