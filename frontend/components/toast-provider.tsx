"use client";

import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";

import type { ToastInput, ToastItem } from "@/types/ui";

interface ToastContextValue {
  pushToast: (toast: ToastInput) => void;
  dismissToast: (id: string) => void;
}

const TOAST_TIMEOUT_MS = 4000;

const ToastContext = createContext<ToastContextValue | null>(null);

const buildToastId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const toastTypeLabel: Record<ToastItem["type"], string> = {
  success: "Успех",
  error: "Ошибка",
  info: "Сообщение"
};

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: ToastInput) => {
      const id = buildToastId();

      setToasts((currentToasts) => [...currentToasts, { id, ...toast }]);

      window.setTimeout(() => {
        dismissToast(id);
      }, TOAST_TIMEOUT_MS);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      pushToast,
      dismissToast
    }),
    [dismissToast, pushToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="cw-toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <section
            key={toast.id}
            className={`cw-toast cw-toast-${toast.type}`}
            aria-label={toastTypeLabel[toast.type]}
          >
            <div className="cw-toast-copy">
              {toast.title ? <p className="cw-toast-title">{toast.title}</p> : null}
              <p className="cw-toast-message">{toast.message}</p>
            </div>

            <button
              type="button"
              className="cw-toast-dismiss"
              aria-label="Закрыть уведомление"
              onClick={() => dismissToast(toast.id)}
            >
              Закрыть
            </button>
          </section>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }

  return context;
};
