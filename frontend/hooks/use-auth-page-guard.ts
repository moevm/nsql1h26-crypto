import { useRouter } from "next/router";
import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";

export const useAuthPageGuard = (): boolean => {
  const router = useRouter();
  const { isHydrated, session } = useAuth();

  useEffect(() => {
    if (isHydrated && session) {
      void router.replace("/app");
    }
  }, [isHydrated, router, session]);

  return isHydrated && !session;
};
