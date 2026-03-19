"use client";

import { AlertCircle, Loader2, RefreshCw, WifiOff } from "lucide-react";

/**
 * 🔄 Loading State
 */
export function LoadingState({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

/**
 * ❌ Error State
 */
export function ErrorState({ 
  message = "Error al cargar los datos",
  onRetry,
}: { 
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-gray-400 text-sm mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      )}
    </div>
  );
}

/**
 * 📭 Empty State
 */
export function EmptyState({ 
  message = "No hay datos disponibles",
  icon: Icon = AlertCircle,
}: { 
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-gray-500" />
      </div>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

/**
 * 📵 Offline State
 */
export function OfflineState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-3">
        <WifiOff className="w-6 h-6 text-yellow-500" />
      </div>
      <p className="text-gray-400 text-sm">Sin conexión a internet</p>
      <p className="text-gray-500 text-xs mt-1">Verifica tu conexión e intenta de nuevo</p>
    </div>
  );
}

/**
 * 🃏 Agent Card Skeleton
 */
export function AgentCardSkeleton() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 animate-pulse">
      {/* Avatar */}
      <div className="w-20 h-20 mx-auto rounded-full bg-gray-700 mb-4" />
      
      {/* Name */}
      <div className="h-5 bg-gray-700 rounded w-3/4 mx-auto mb-2" />
      
      {/* Rarity */}
      <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto mb-3" />
      
      {/* Traits */}
      <div className="h-3 bg-gray-700 rounded w-2/3 mx-auto mb-4" />
      
      {/* Fitness */}
      <div className="h-6 bg-gray-700 rounded w-1/3 mx-auto" />
    </div>
  );
}

/**
 * 🃏 Agent Card Error
 */
export function AgentCardError({ agentId }: { agentId?: string }) {
  return (
    <div className="bg-gray-900/50 border border-red-900/50 rounded-xl p-4">
      <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500/50" />
      </div>
      <p className="text-center text-gray-500 text-sm">
        Error al cargar agente
      </p>
      {agentId && (
        <p className="text-center text-gray-600 text-xs mt-1">
          ID: {agentId.slice(0, 8)}...
        </p>
      )}
    </div>
  );
}

/**
 * 📋 Agent List Loading
 */
export function AgentListLoading({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <AgentCardSkeleton key={i} />
      ))}
    </div>
  );
}
