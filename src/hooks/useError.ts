// src/hooks/useError.ts
// Centralized error handling hook

import { useState, useCallback } from "react";

export type ErrorType = "generic" | "network" | "auth" | "server" | "notFound" | "forbidden";

interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  timestamp: Date;
}

interface UseErrorReturn {
  error: AppError | null;
  setError: (error: AppError | null) => void;
  handleError: (err: unknown, fallbackMessage?: string) => void;
  clearError: () => void;
  isError: boolean;
}

/**
 * Classify error type from HTTP status or error object
 */
function classifyError(err: unknown): ErrorType {
  if (err instanceof TypeError && err.message.includes("fetch")) {
    return "network";
  }
  
  if (err instanceof Response) {
    if (err.status === 401) return "auth";
    if (err.status === 403) return "forbidden";
    if (err.status === 404) return "notFound";
    if (err.status >= 500) return "server";
  }
  
  if (typeof err === "object" && err !== null) {
    const status = (err as { status?: number }).status;
    if (status === 401) return "auth";
    if (status === 403) return "forbidden";
    if (status === 404) return "notFound";
    if (status && status >= 500) return "server";
  }
  
  return "generic";
}

/**
 * Extract error message from various error types
 */
function extractMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) {
    return err.message;
  }
  
  if (typeof err === "object" && err !== null) {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
  }
  
  if (typeof err === "string") {
    return err;
  }
  
  return fallback;
}

export function useError(): UseErrorReturn {
  const [error, setError] = useState<AppError | null>(null);

  const handleError = useCallback((err: unknown, fallbackMessage = "Ocurrió un error inesperado") => {
    console.error("[useError]", err);
    
    const type = classifyError(err);
    const message = extractMessage(err, fallbackMessage);
    
    setError({
      type,
      message,
      details: err instanceof Error ? err.stack : undefined,
      timestamp: new Date(),
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    setError,
    handleError,
    clearError,
    isError: error !== null,
  };
}

/**
 * Wrapper for async functions with error handling
 */
export function useAsyncError() {
  const { handleError, clearError, error, isError } = useError();
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options?: { 
      onSuccess?: (data: T) => void;
      onError?: (error: AppError) => void;
      fallbackMessage?: string;
    }
  ): Promise<T | null> => {
    setLoading(true);
    clearError();
    
    try {
      const result = await asyncFn();
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      handleError(err, options?.fallbackMessage);
      if (error) options?.onError?.(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError, error]);

  return {
    execute,
    loading,
    error,
    isError,
    clearError,
  };
}

export default useError;
