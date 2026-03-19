// src/components/onboarding/EmptyStates.tsx
// Empty states with clear CTAs for onboarding

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Dna, Bot, Sparkles, Users, TrendingUp, Bell, 
  Plus, ArrowRight, Zap, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button-shadcn";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  className?: string;
}

/**
 * No Agents Empty State
 */
export function NoAgentsState({ className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}
    >
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <Dna className="h-12 w-12 text-primary" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
        >
          <Plus className="h-5 w-5 text-primary-foreground" />
        </motion.div>
      </div>

      <h3 className="text-xl font-semibold mb-2">No tienes agentes todavía</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Crea tu primer agente AI y comienza a participar en el ecosistema de breeding.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="gap-2">
          <Link href="/profile">
            <Bot className="h-4 w-4" />
            Vincular Agente
          </Link>
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">
            Crear Bot <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </motion.div>
  );
}

/**
 * No Breeding Requests Empty State
 */
export function NoBreedingRequestsState({ className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-red-500/20 flex items-center justify-center mb-6">
        <Heart className="h-10 w-10 text-pink-500" />
      </div>

      <h3 className="text-lg font-semibold mb-2">Sin solicitudes de breeding</h3>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">
        Cuando otros usuarios quieran cruzar sus agentes con los tuyos, las solicitudes aparecerán aquí.
      </p>

      <Button variant="outline" asChild size="sm">
        <Link href="/breeding">
          Explorar Breeding <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </Button>
    </motion.div>
  );
}

/**
 * No Notifications Empty State
 */
export function NoNotificationsState({ className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center py-8 px-4 text-center", className)}
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Bell className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold mb-1">Todo al día</h3>
      <p className="text-muted-foreground text-sm">
        No tienes notificaciones pendientes.
      </p>
    </motion.div>
  );
}

/**
 * Empty Leaderboard State
 */
export function EmptyLeaderboardState({ className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mb-6">
        <TrendingUp className="h-10 w-10 text-yellow-500" />
      </div>

      <h3 className="text-lg font-semibold mb-2">Leaderboard vacío</h3>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">
        Sé el primero en activar un agente y aparecer en el leaderboard!
      </p>

      <Button asChild className="gap-2">
        <Link href="/profile">
          <Zap className="h-4 w-4" />
          Activar Agente
        </Link>
      </Button>
    </motion.div>
  );
}

/**
 * No Available Agents for Breeding
 */
export function NoAvailableAgentsState({ className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
        <Users className="h-10 w-10 text-blue-500" />
      </div>

      <h3 className="text-lg font-semibold mb-2">No hay agentes disponibles</h3>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">
        Actualmente no hay agentes de otros usuarios disponibles para breeding.
      </p>

      <Button variant="outline" asChild size="sm">
        <Link href="/agents">
          Ver todos los agentes
        </Link>
      </Button>
    </motion.div>
  );
}

/**
 * First Time Dashboard CTA
 */
export function FirstTimeDashboardCTA({ className, onDismiss }: EmptyStateProps & { onDismiss?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative p-6 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border border-primary/20",
        className
      )}
    >
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      )}

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-semibold mb-1">¡Bienvenido a Genomad!</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Completa estos pasos para comenzar a usar todas las funciones de la plataforma.
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-500 text-xs">✓</span>
              </div>
              <span>Wallet conectada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-xs">2</span>
              </div>
              <span className="text-muted-foreground">Vincular agente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-xs">3</span>
              </div>
              <span className="text-muted-foreground">Activar on-chain</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <Button asChild>
            <Link href="/profile">
              Continuar <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default {
  NoAgentsState,
  NoBreedingRequestsState,
  NoNotificationsState,
  EmptyLeaderboardState,
  NoAvailableAgentsState,
  FirstTimeDashboardCTA,
};
