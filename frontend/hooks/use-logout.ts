import { useState } from "react";
import { useRouter } from "next/router";

import { useToastContext } from "@/components/toast-provider";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/auth";

export const useLogout = () => {
  const router = useRouter();
  const { session, clearSession } = useAuth();
  const { pushToast } = useToastContext();
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
      pushToast({
        type: "success",
        message: "Вы вышли из аккаунта"
      });
      await router.push("/auth/login");

      if (hasLogoutError) {
        pushToast({
          type: "error",
          message: "Сеанс завершен только локально!"
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
