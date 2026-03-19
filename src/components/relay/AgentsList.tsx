"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePrivy } from "@privy-io/react-auth"
import { 
  Cpu, RefreshCw, Power, PowerOff, Wifi, WifiOff,
  ChevronRight, Dna, Sparkles, AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, Badge, Button } from "@/components/ui"
import { cn } from "@/lib/utils"

interface RelayAgent {
  id: string
  name: string
  status: 'online' | 'offline' | 'provisioning' | 'error'
  workspacePath?: string
}

interface Connection {
  id: string
  connectedAt: string
  lastHeartbeat: string
  agents: string[]
}

interface AgentsListProps {
  className?: string
  onAgentClick?: (agentId: string) => void
  showControls?: boolean
}

export function AgentsList({ 
  className,
  onAgentClick,
  showControls = true 
}: AgentsListProps) {
  const { user, getAccessToken } = usePrivy()
  const [loading, setLoading] = useState(true)
  const [connections, setConnections] = useState<Connection[]>([])
  const [agents, setAgents] = useState<RelayAgent[]>([])
  const [error, setError] = useState<string | null>(null)

  const userId = user?.id

  const fetchData = async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      // Fetch relay status
      const relayRes = await fetch(`/api/relay?userId=${userId}`)
      const relayData = await relayRes.json()

      setConnections(relayData.connections || [])

      // Fetch my agents from API
      const token = await getAccessToken()
      if (!token) return

      const agentsRes = await fetch('/api/agents', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const agentsData = await agentsRes.json()

      // Merge relay status with agent data
      const myAgents = agentsData.agents || []
      const connectedAgentIds = new Set(
        relayData.connections?.flatMap((c: Connection) => c.agents) || []
      )

      const mergedAgents: RelayAgent[] = myAgents.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        status: connectedAgentIds.has(agent.id) 
          ? 'online' 
          : agent.isActive 
          ? 'offline' 
          : 'offline',
      }))

      setAgents(mergedAgents)

    } catch (err) {
      setError('Failed to fetch agents')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const handleActivate = async (agentId: string) => {
    try {
      const token = await getAccessToken()
      if (!token) return

      const res = await fetch(`/api/agents/${agentId}/activate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error('Failed to activate:', err)
    }
  }

  const handleDeactivate = async (agentId: string) => {
    try {
      const token = await getAccessToken()
      if (!token) return

      const res = await fetch(`/api/agents/${agentId}/activate?userId=${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error('Failed to deactivate:', err)
    }
  }

  const isConnected = connections.length > 0
  const onlineCount = agents.filter(a => a.status === 'online').length

  return (
    <Card className={cn("border-zinc-800 bg-zinc-900/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Mis Agentes</h3>
            <Badge variant="outline" className="text-xs">
              {onlineCount}/{agents.length} online
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge className="bg-green-500/20 text-green-400 text-xs">
                <Wifi className="w-3 h-3 mr-1" />
                Relay
              </Badge>
            ) : (
              <Badge variant="outline" className="text-zinc-500 text-xs">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {loading && agents.length === 0 ? (
          <div className="text-center py-6">
            <Dna className="w-8 h-8 mx-auto animate-pulse text-purple-400" />
            <p className="text-sm text-zinc-500 mt-2">Cargando agentes...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-6">
            <Sparkles className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="text-sm text-zinc-500 mt-2">No tienes agentes aún</p>
            <p className="text-xs text-zinc-600 mt-1">
              Vincula tu primer agente en Profile
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
                  agent.status === 'online'
                    ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10"
                    : agent.status === 'error'
                    ? "bg-red-500/5 border-red-500/20"
                    : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800"
                )}
                onClick={() => onAgentClick?.(agent.id)}
              >
                <div className="flex items-center gap-3">
                  {/* Status Indicator */}
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    agent.status === 'online' && "bg-green-400 animate-pulse",
                    agent.status === 'offline' && "bg-zinc-500",
                    agent.status === 'provisioning' && "bg-yellow-400 animate-pulse",
                    agent.status === 'error' && "bg-red-400"
                  )} />

                  {/* Agent Icon */}
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    agent.status === 'online'
                      ? "bg-green-500/20"
                      : "bg-zinc-700"
                  )}>
                    <Cpu className={cn(
                      "w-4 h-4",
                      agent.status === 'online' ? "text-green-400" : "text-zinc-400"
                    )} />
                  </div>

                  {/* Agent Info */}
                  <div>
                    <p className="font-medium text-sm text-white">{agent.name}</p>
                    <p className="text-xs text-zinc-500">
                      {agent.status === 'online' && 'Corriendo'}
                      {agent.status === 'offline' && 'Detenido'}
                      {agent.status === 'provisioning' && 'Iniciando...'}
                      {agent.status === 'error' && 'Error'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {showControls && (
                  <div className="flex items-center gap-2">
                    {agent.status === 'online' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeactivate(agent.id)
                        }}
                        className="text-zinc-400 hover:text-red-400"
                        title="Detener"
                      >
                        <PowerOff className="w-4 h-4" />
                      </Button>
                    ) : agent.status === 'offline' && isConnected ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleActivate(agent.id)
                        }}
                        className="text-zinc-400 hover:text-green-400"
                        title="Iniciar"
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                    ) : agent.status === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : null}
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Connection info */}
        {connections.length > 0 && (
          <div className="pt-2 border-t border-zinc-800 mt-3">
            <p className="text-xs text-zinc-500">
              {connections.length} conexión{connections.length > 1 ? 'es' : ''} activa{connections.length > 1 ? 's' : ''}
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 mt-2">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}
