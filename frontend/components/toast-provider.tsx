"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import type { ToastInput, ToastItem } from "@/types/ui";

interface ToastContextValue {
  pushToast: (toast: ToastInput) => void;
  dismissToast: (id: string) => void;
}

const TOAST_TIMEOUT_MS = 4000;
const MAX_TOASTS = 4;

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
  const timeoutIdsRef = useRef(new Map<string, number>());
  const toastsRef = useRef<ToastItem[]>([]);

  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

  const clearToastTimeout = useCallback((id: string) => {
    const timeoutId = timeoutIdsRef.current.get(id);

    if (!timeoutId) {
      return;
    }

    window.clearTimeout(timeoutId);
    timeoutIdsRef.current.delete(id);
  }, []);

  useEffect(() => {
    const timeoutIds = timeoutIdsRef.current;

    return () => {
      timeoutIds.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      timeoutIds.clear();
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    clearToastTimeout(id);
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, [clearToastTimeout]);

  const pushToast = useCallback(
    (toast: ToastInput) => {
      const hasDuplicateToast = toastsRef.current.some(
        (currentToast) =>
          currentToast.type === toast.type &&
          currentToast.message === toast.message &&
          currentToast.title === toast.title
      );

      if (hasDuplicateToast) {
        return;
      }

      const id = buildToastId();
      const nextToast = { id, ...toast };

      setToasts((currentToasts) => {
        const nextToasts = [...currentToasts, nextToast];

        if (nextToasts.length <= MAX_TOASTS) {
          return nextToasts;
        }

        const removedToasts = nextToasts.slice(0, nextToasts.length - MAX_TOASTS);

        removedToasts.forEach((removedToast) => {
          clearToastTimeout(removedToast.id);
        });

        return nextToasts.slice(-MAX_TOASTS);
      });

      const timeoutId = window.setTimeout(() => {
        dismissToast(id);
      }, TOAST_TIMEOUT_MS);

      timeoutIdsRef.current.set(id, timeoutId);
    },
    [clearToastTimeout, dismissToast]
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
