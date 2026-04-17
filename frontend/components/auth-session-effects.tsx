"use client";

import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";
import { registerUnauthorizedHandler } from "@/services/auth-http-client";

export const AuthSessionEffects = () => {
  const { clearSession, setAuthFlowNotice } = useAuth();

  useEffect(() => {
    return registerUnauthorizedHandler(() => {
      clearSession();
      setAuthFlowNotice({
        tone: "error",
        message: "Сессия истекла"
      });
    });
  }, [clearSession, setAuthFlowNotice]);

  return null;
};
