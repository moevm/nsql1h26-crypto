"use client";

import { PropsWithChildren } from "react";

import { useAuthRouting } from "@/hooks/use-auth-routing";

export const ProtectedPage = ({ children }: PropsWithChildren) => {
  const isReady = useAuthRouting({ mode: "protected" });

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
};
