"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConnectionIndicatorProps {
  userId?: string | null
  className?: string
  showLabel?: boolean
}

export function ConnectionIndicator({ 
  userId, 
  className,
  showLabel = false 
}: ConnectionIndicatorProps) {
  const [connected, setConnected] = useState(false)
  const [agentCount, setAgentCount] = useState(0)

  useEffect(() => {
    if (!userId) return

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/relay?userId=${userId}`)
        const data = await response.json()
        setConnected(data.connected)
        
        // Count total agents across connections
        const agents = data.connections?.reduce(
          (acc: number, conn: any) => acc + (conn.agents?.length || 0), 
          0
        ) || 0
        setAgentCount(agents)
      } catch {
        setConnected(false)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [userId])

  if (!userId) return null

  const tooltip = connected 
    ? `OpenClaw connected${agentCount > 0 ? ` • ${agentCount} agent${agentCount > 1 ? 's' : ''} running` : ''}`
    : 'OpenClaw not connected'

  return (
    <div 
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors cursor-default",
        connected 
          ? "bg-green-500/10 text-green-400" 
          : "bg-zinc-800 text-zinc-500",
        className
      )}
      title={tooltip}
    >
      {connected ? (
        <>
          <div className="relative">
            <Wifi className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          </div>
          {showLabel && (
            <span className="text-xs font-medium">
              {agentCount > 0 ? `${agentCount} agent${agentCount > 1 ? 's' : ''}` : 'Relay'}
            </span>
          )}
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          {showLabel && (
            <span className="text-xs">Offline</span>
          )}
        </>
      )}
    </div>
  )
}
