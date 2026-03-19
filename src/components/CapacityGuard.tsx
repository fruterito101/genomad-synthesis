"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Clock, RefreshCw } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'

interface CapacityGuardProps {
  children: React.ReactNode
}

interface CapacityStatus {
  allowed: boolean
  currentCount: number
  message?: string
}

export function CapacityGuard({ children }: CapacityGuardProps) {
  const { user, authenticated } = usePrivy()
  const [status, setStatus] = useState<CapacityStatus | null>(null)
  const [checking, setChecking] = useState(true)
  const [retryIn, setRetryIn] = useState(0)

  const checkCapacity = async () => {
    if (!authenticated || !user?.id) {
      setStatus({ allowed: true, currentCount: 0 })
      setChecking(false)
      return
    }

    try {
      const res = await fetch(`/api/relay/capacity?userId=${user.id}`)
      const data = await res.json()
      setStatus(data)
      
      if (!data.allowed) {
        // Start retry countdown
        setRetryIn(60)
      }
    } catch {
      // Allow on error
      setStatus({ allowed: true, currentCount: 0 })
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    checkCapacity()
  }, [authenticated, user?.id])

  // Retry countdown
  useEffect(() => {
    if (retryIn <= 0) return
    
    const timer = setInterval(() => {
      setRetryIn(r => {
        if (r <= 1) {
          checkCapacity()
          return 0
        }
        return r - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [retryIn])

  // Still checking
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Verificando disponibilidad...</p>
        </motion.div>
      </div>
    )
  }

  // At capacity - show waiting screen
  if (status && !status.allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-amber-400" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold mb-3">
              Plataforma ocupada
            </h1>

            {/* Message */}
            <p className="text-muted-foreground mb-6">
              {status.message || 'Hay muchos usuarios usando la plataforma en este momento. Por favor espera unos minutos e intenta de nuevo.'}
            </p>

            {/* Stats */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {status.currentCount}/99 usuarios conectados
                </span>
              </div>
            </div>

            {/* Retry timer */}
            {retryIn > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Reintentando en {retryIn}s...</span>
              </div>
            )}

            {/* Manual retry button */}
            {retryIn === 0 && (
              <button
                onClick={() => {
                  setChecking(true)
                  checkCapacity()
                }}
                className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar ahora
              </button>
            )}
          </div>

          {/* Tip */}
          <p className="text-xs text-muted-foreground mt-4">
            💡 Tip: Las conexiones inactivas se cierran automáticamente después de 30 minutos
          </p>
        </motion.div>
      </div>
    )
  }

  // Allowed - render children
  return <>{children}</>
}
