// src/components/Toast.tsx
// Simple toast notification system

"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastConfig: Record<ToastType, { icon: typeof CheckCircle; bg: string; border: string }> = {
  success: {
    icon: CheckCircle,
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  info: {
    icon: Info,
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
};

const iconColors: Record<ToastType, string> = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: "success", title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: "error", title, message, duration: 7000 });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: "warning", title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: "info", title, message });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm",
        config.bg,
        config.border
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconColors[toast.type])} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-muted-foreground mt-1">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export default ToastProvider;
