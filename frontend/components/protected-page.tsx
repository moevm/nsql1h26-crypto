import { PropsWithChildren } from "react";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { useAuthRouting } from "@/hooks/use-auth-routing";
import { AUTH_ROLES } from "@/services/auth/auth-roles";
import type { AuthRole } from "@/types/auth";

interface ProtectedPageProps extends PropsWithChildren {
  requiredRole?: AuthRole;
}

export const ProtectedPage = ({ children, requiredRole }: ProtectedPageProps) => {
  const isReady = useAuthRouting({ mode: "protected" });
  const { session } = useAuth();

  if (!isReady) {
    return (
      <LoadingState
        title="Проверяем доступ..."
        message="Открываем нужный раздел..."
      />
    );
  }

  if (requiredRole && session?.role !== requiredRole) {
    const roleMessage =
      requiredRole === AUTH_ROLES.ADMIN
        ? "Эта страница доступна только администратору"
        : "У вас недостаточно прав для этой страницы";

    return <ErrorState title="Доступ запрещен" message={roleMessage} />;
  }

  return <>{children}</>;
};
