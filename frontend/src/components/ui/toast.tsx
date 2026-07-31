import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { createPortal } from "react-dom";

import { cn } from "../../lib/cn";

export type ToastTone = "success" | "error" | "info";

type Toast = { id: number; tone: ToastTone; message: string };

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

// plan §3.3 — top-right, auto-dismiss after 4s
const AUTO_DISMISS_MS = 4000;

const tones: Record<ToastTone, { className: string; icon: ReactNode }> = {
  success: {
    className: "bg-mint text-forest",
    icon: (
      <svg viewBox="0 0 20 20" className="size-5 shrink-0" fill="currentColor" aria-hidden="true">
        <path d="M10 1.7a8.3 8.3 0 1 0 0 16.6 8.3 8.3 0 0 0 0-16.6Zm3.9 6.2-4.6 4.7a.9.9 0 0 1-1.3 0L6.1 10.6a.9.9 0 1 1 1.3-1.3l1.3 1.4 4-4.1a.9.9 0 1 1 1.2 1.3Z" />
      </svg>
    )
  },
  error: {
    className: "bg-danger-soft text-danger",
    icon: (
      <svg viewBox="0 0 20 20" className="size-5 shrink-0" fill="currentColor" aria-hidden="true">
        <path d="M10 1.7a8.3 8.3 0 1 0 0 16.6 8.3 8.3 0 0 0 0-16.6Zm3 10.1a.9.9 0 0 1-1.2 1.2L10 11.3l-1.8 1.7A.9.9 0 0 1 7 11.8L8.7 10 7 8.2A.9.9 0 1 1 8.2 7L10 8.7 11.8 7A.9.9 0 0 1 13 8.2L11.3 10 13 11.8Z" />
      </svg>
    )
  },
  info: {
    className: "bg-ceramic text-text",
    icon: (
      <svg viewBox="0 0 20 20" className="size-5 shrink-0" fill="currentColor" aria-hidden="true">
        <path d="M10 1.7a8.3 8.3 0 1 0 0 16.6 8.3 8.3 0 0 0 0-16.6ZM10 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm1 9.2H9V8.6h2Z" />
      </svg>
    )
  }
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const push = useCallback((tone: ToastTone, message: string) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, tone, message }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), AUTO_DISMISS_MS);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message)
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed top-4 right-4 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
          role="status"
          aria-live="polite"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex items-start gap-2.5 rounded-card px-4 py-3 text-[14px] font-medium shadow-card",
                tones[toast.tone].className
              )}
            >
              {tones[toast.tone].icon}
              <span className="pt-px">{toast.message}</span>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
