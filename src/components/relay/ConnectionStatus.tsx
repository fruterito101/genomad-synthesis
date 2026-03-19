"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wifi, WifiOff, RefreshCw, Copy, Check, Terminal } from "lucide-react"
import { Card, CardContent, CardHeader, Badge, Button } from "@/components/ui"
import { cn } from "@/lib/utils"

interface ConnectionStatusProps {
  userId?: string | null
  className?: string
}

interface RelayStatus {
  connected: boolean
  connections?: Array<{
    id: string
    connectedAt: string
    lastHeartbeat: string
    agents: string[]
  }>
}

export function ConnectionStatus({ userId, className }: ConnectionStatusProps) {
  const [status, setStatus] = useState<RelayStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchStatus = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/relay?userId=${userId}`)
      const data = await response.json()
      setStatus(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const copySetupCommand = async () => {
    const command = `mkdir -p ~/.genomad && echo '{"userId":"${userId}"}' > ~/.genomad/config.json`
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!userId) {
    return (
      <Card className={cn("border-zinc-800 bg-zinc-900/50", className)}>
        <CardContent className="pt-6">
          <p className="text-zinc-400 text-sm">Connect wallet to see relay status</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-zinc-800 bg-zinc-900/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-zinc-400" />
            <h3 className="font-semibold text-white">OpenClaw Relay</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchStatus}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {status?.connected ? (
              <motion.div
                key="connected"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <div className="relative">
                  <Wifi className="w-5 h-5 text-green-400" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
                <span className="text-green-400 font-medium">Connected</span>
              </motion.div>
            ) : (
              <motion.div
                key="disconnected"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <WifiOff className="w-5 h-5 text-zinc-500" />
                <span className="text-zinc-500">Not Connected</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Connected: Show connections */}
        {status?.connected && status.connections && status.connections.length > 0 && (
          <div className="space-y-2">
            {status.connections.map((conn) => (
              <div 
                key={conn.id}
                className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {conn.id.slice(0, 8)}...
                  </Badge>
                  <span className="text-xs text-zinc-500">
                    {new Date(conn.lastHeartbeat).toLocaleTimeString()}
                  </span>
                </div>
                {conn.agents.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {conn.agents.map((agentId) => (
                      <Badge 
                        key={agentId} 
                        className="bg-purple-500/20 text-purple-300 text-xs"
                      >
                        🤖 {agentId.slice(0, 8)}...
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Not Connected: Show setup instructions */}
        {!status?.connected && !loading && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">
              Connect your OpenClaw to run agents locally:
            </p>
            
            <div className="relative">
              <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-300 overflow-x-auto">
                <code>{`# 1. Configure
mkdir -p ~/.genomad
echo '{"userId":"${userId?.slice(0, 20)}..."}' > ~/.genomad/config.json

# 2. Connect
cd genomad/skills/genomad-relay
npx tsx scripts/connect.ts`}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={copySetupCommand}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            <p className="text-xs text-zinc-500">
              Once connected, agents you activate will automatically provision on your machine.
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}
