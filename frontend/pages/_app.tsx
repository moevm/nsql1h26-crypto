import type { AppProps } from "next/app";

import { AuthProvider } from "@/components/auth-provider";
import { AuthSessionEffects } from "@/components/auth-session-effects";
import { ToastProvider } from "@/components/toast-provider";

import "@/styles/globals.css";
import "@/styles/layouts.css";
import "@/styles/ui.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AuthSessionEffects />
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </AuthProvider>
  );
}
