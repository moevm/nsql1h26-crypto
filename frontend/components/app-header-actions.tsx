import { AUTH_ROLES } from "@/services/auth/auth-roles";
import { AppNavigation } from "@/components/app-navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLogout } from "@/hooks/use-logout";
import type { AppSection } from "@/types/ui";

interface AppHeaderActionsProps {
  activeSection: AppSection;
}

export const AppHeaderActions = ({ activeSection }: AppHeaderActionsProps) => {
  const { session } = useAuth();
  const { isSubmitting, logout } = useLogout();
  const roleLabel = session?.role === AUTH_ROLES.ADMIN ? "Администратор" : "Пользователь";

  return (
    <div className="cw-app-header-row">
      <div>
        <p className="cw-kicker mb-0">CryptoWatch</p>
        {session ? (
          <div className="cw-session-card">
            <p className="cw-session-login">{session.login}</p>
            <p className="cw-session-role">{roleLabel}</p>
          </div>
        ) : null}
      </div>
      <div className="cw-app-header-actions">
        <AppNavigation activeSection={activeSection} />
        <button
          className="cw-button-ghost"
          type="button"
          onClick={() => void logout()}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Выходим..." : "Выйти"}
        </button>
      </div>
    </div>
  );
};
