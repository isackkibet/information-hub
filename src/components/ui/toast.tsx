"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle, AlertCircle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { toast: () => {} };
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="h-5 w-5 text-emerald-600" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
  };

  const borders: Record<ToastType, string> = {
    success: "border-l-emerald-500",
    error: "border-l-rose-500",
    info: "border-l-blue-500",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-border border-l-4 bg-card px-4 py-3 shadow-lg",
              borders[t.type]
            )}
          >
            {icons[t.type]}
            <p className="text-sm">{t.message}</p>
            <button onClick={() => remove(t.id)} className="ml-2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
