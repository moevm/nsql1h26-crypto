import type { AppProps } from "next/app";

import { ToastProvider } from "@/components/toast-provider";

import "@/styles/globals.css";
import "@/styles/layouts.css";
import "@/styles/ui.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <Component {...pageProps} />
    </ToastProvider>
  );
}
