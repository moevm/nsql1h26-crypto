import { useState } from "react";
import { useRouter } from "next/router";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth";

export const useLogout = () => {
  const router = useRouter();
  const { session, clearSession, setAuthFlowMessage } = useAuth();
  const { pushToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logout = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    let hasLogoutError = false;

    try {
      if (session?.token) {
        await authService.logout(session.token);
      }
    } catch {
      hasLogoutError = true;
    } finally {
      clearSession();
      setAuthFlowMessage("Вы вышли из аккаунта");
      await router.push("/auth/login");

      if (hasLogoutError) {
        pushToast({
          type: "error",
          message: "Сеанс завершен локально, но запрос logout не дошел до backend."
        });
      }

      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    logout
  };
};
