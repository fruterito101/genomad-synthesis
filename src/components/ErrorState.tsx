// src/components/ErrorState.tsx
// Error states and inline error components

"use client";

import { AlertCircle, AlertTriangle, RefreshCw, WifiOff, Lock, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button-shadcn";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ErrorType = "generic" | "network" | "auth" | "server" | "notFound" | "forbidden";

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

const errorConfig: Record<ErrorType, { icon: typeof AlertCircle; title: string; message: string; color: string }> = {
  generic: {
    icon: AlertCircle,
    title: "Algo salió mal",
    message: "Ocurrió un error inesperado. Por favor intenta de nuevo.",
    color: "text-red-500",
  },
  network: {
    icon: WifiOff,
    title: "Sin conexión",
    message: "No pudimos conectar con el servidor. Verifica tu conexión a internet.",
    color: "text-orange-500",
  },
  auth: {
    icon: Lock,
    title: "Sesión expirada",
    message: "Tu sesión ha expirado. Por favor inicia sesión de nuevo.",
    color: "text-yellow-500",
  },
  server: {
    icon: ServerCrash,
    title: "Error del servidor",
    message: "Nuestros servidores están teniendo problemas. Intenta en unos minutos.",
    color: "text-red-500",
  },
  notFound: {
    icon: AlertTriangle,
    title: "No encontrado",
    message: "El recurso que buscas no existe o fue eliminado.",
    color: "text-gray-500",
  },
  forbidden: {
    icon: Lock,
    title: "Acceso denegado",
    message: "No tienes permiso para acceder a este recurso.",
    color: "text-red-500",
  },
};

export function ErrorState({
  type = "generic",
  title,
  message,
  onRetry,
  className,
  compact = false,
}: ErrorStateProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20", className)}>
        <Icon className={cn("h-5 w-5 flex-shrink-0", config.color)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{title || config.title}</p>
          <p className="text-xs text-muted-foreground truncate">{message || config.message}</p>
        </div>
        {onRetry && (
          <Button size="sm" variant="ghost" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("border-destructive/20", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4", 
          type === "network" ? "bg-orange-500/20" : "bg-destructive/20"
        )}>
          <Icon className={cn("h-8 w-8", config.color)} />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{title || config.title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {message || config.message}
        </p>
        
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Inline error message for forms
 */
export function ErrorMessage({ message, className }: { message: string; className?: string }) {
  return (
    <p className={cn("text-sm text-destructive flex items-center gap-1", className)}>
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  );
}

/**
 * Error alert banner
 */
export function ErrorAlert({
  title,
  message,
  onDismiss,
  className,
}: {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20",
      className
    )}>
      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-medium text-destructive">{title}</p>}
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      )}
    </div>
  );
}

/**
 * Empty state (no data, not an error)
 */
export function EmptyState({
  icon: Icon = AlertCircle,
  title,
  message,
  action,
  className,
}: {
  icon?: typeof AlertCircle;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{message}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
