import { useRouter } from "next/router";
import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";

type AuthRouteMode = "root" | "guest-only" | "protected";

interface UseAuthRoutingOptions {
  mode: AuthRouteMode;
}

export const useAuthRouting = ({ mode }: UseAuthRoutingOptions): boolean => {
  const router = useRouter();
  const { status, session } = useAuth();

  useEffect(() => {
    if (status === "checking") {
      return;
    }

    if (mode === "root") {
      void router.replace(session ? "/app" : "/auth/login");
      return;
    }

    if (mode === "guest-only" && session) {
      void router.replace("/app");
      return;
    }

    if (mode === "protected" && !session) {
      void router.replace("/auth/login");
    }
  }, [mode, router, session, status]);

  if (status === "checking") {
    return false;
  }

  if (mode === "root") {
    return false;
  }

  if (mode === "guest-only") {
    return !session;
  }

  return !!session;
};
