import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";
import { useToastContext } from "@/components/toast-provider";
import { registerUnauthorizedHandler } from "@/services/http/authorized-http-client";

export const AuthSessionEffects = () => {
  const { clearSession } = useAuth();
  const { pushToast } = useToastContext();

  useEffect(() => {
    return registerUnauthorizedHandler(() => {
      clearSession();
      pushToast({
        type: "error",
        message: "Сессия истекла"
      });
    });
  }, [clearSession, pushToast]);

  return null;
};
