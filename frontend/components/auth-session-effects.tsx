"use client";

import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { registerUnauthorizedHandler } from "@/services/auth-http-client";

export const AuthSessionEffects = () => {
  const { clearSession } = useAuth();
  const { pushToast } = useToast();

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
