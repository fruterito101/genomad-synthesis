// src/components/LoadingState.tsx
// Generic loading state with spinner and skeleton options

"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DashboardSkeleton,
  ProfileSkeleton,
  BreedingSkeleton,
  AgentCardSkeleton,
  TableSkeleton,
} from "@/components/skeletons";

type LoadingVariant = 
  | "spinner"
  | "dashboard"
  | "profile"
  | "breeding"
  | "agents"
  | "table"
  | "inline";

interface LoadingStateProps {
  variant?: LoadingVariant;
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  count?: number;
}

export function LoadingState({
  variant = "spinner",
  message,
  className,
  size = "md",
  count = 3,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  // Skeleton variants
  if (variant === "dashboard") return <DashboardSkeleton />;
  if (variant === "profile") return <ProfileSkeleton />;
  if (variant === "breeding") return <BreedingSkeleton />;
  if (variant === "table") return <TableSkeleton rows={count} />;
  
  if (variant === "agents") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(count)].map((_, i) => (
          <AgentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Inline spinner (for buttons, etc)
  if (variant === "inline") {
    return (
      <Loader2 
        className={cn("animate-spin", sizeClasses[size], className)} 
      />
    );
  }

  // Default: centered spinner
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3 py-12",
      className
    )}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

/**
 * Loading overlay for modals and full-page loading
 */
export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        {message && (
          <p className="text-lg font-medium text-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Inline loading for text content
 */
export function LoadingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="animate-bounce [animation-delay:-0.3s]">.</span>
      <span className="animate-bounce [animation-delay:-0.15s]">.</span>
      <span className="animate-bounce">.</span>
    </span>
  );
}

export default LoadingState;
