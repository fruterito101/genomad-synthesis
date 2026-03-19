"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Cpu, Palette, MessageSquare, Brain, Heart, TrendingUp, 
  GraduationCap, Crown, Star, Eye, Dna, Zap, Check, Loader2, Link2
} from "lucide-react"
import { Card, CardContent, CardHeader, Badge, Button } from "@/components/ui"
import { Avatar, AvatarFallback } from "@/components/ui"
import { CoOwnersDisplay } from "@/components/CoOwnersDisplay"
import { useRegisterAgent } from "@/hooks/useGenomadNFT"
import { cn } from "@/lib/utils"

interface AgentTraits {
  technical: number
  creativity: number
  social: number
  analysis: number
  empathy: number
  trading: number
  teaching: number
  leadership: number
}

interface AgentCardProps {
  agent: {
    id: string
    name: string
    botUsername?: string | null
    fitness: number
    generation: number
    isActive: boolean
    traits: AgentTraits | Record<string, number>
    dnaHash?: string
    commitment?: string | null
    tokenId?: string | null
  }
  isMine?: boolean
  onClick?: () => void
  onViewDetails?: () => void
  onActivated?: (tokenId: string, txHash: string) => void
  showActions?: boolean
  showCoOwners?: boolean
  showTopTraits?: boolean
  getAccessToken?: () => Promise<string | null>
  className?: string
  index?: number
  variant?: "compact" | "full"
  labels?: {
    breed?: string
    viewDetails?: string
    active?: string
    inactive?: string
    activate?: string
    onChain?: string
  }
}

const traitIcons = {
  technical: Cpu, creativity: Palette, social: MessageSquare, analysis: Brain,
  empathy: Heart, trading: TrendingUp, teaching: GraduationCap, leadership: Crown,
}

const traitColors: Record<string, string> = {
  technical: "#3B82F6", creativity: "#EC4899", social: "#8B5CF6", analysis: "#06B6D4",
  empathy: "#EF4444", trading: "#F97316", teaching: "#F59E0B", leadership: "#F97316",
}

function getTopTraits(traits: Record<string, number>, count = 3): { key: string; value: number }[] {
  return Object.entries(traits)
    .filter(([key]) => key !== "skillCount")
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([key, value]) => ({ key, value }))
}

function getRarity(traits: Record<string, number>): { label: string; color: string; bg: string } {
  const values = Object.values(traits).filter(v => typeof v === "number")
  if (values.length === 0) return { label: "Unknown", color: "#6B7280", bg: "rgba(107, 114, 128, 0.1)" }
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const max = Math.max(...values)
  const spread = max - Math.min(...values)
  if (avg >= 80 && spread <= 20) return { label: "Legendary", color: "#FBBF24", bg: "rgba(251, 191, 36, 0.1)" }
  if (avg >= 75 || max >= 95) return { label: "Epic", color: "#A855F7", bg: "rgba(168, 85, 247, 0.1)" }
  if (avg >= 60 || max >= 85) return { label: "Rare", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)" }
  if (avg >= 40) return { label: "Uncommon", color: "#F97316", bg: "rgba(16, 185, 129, 0.1)" }
  return { label: "Common", color: "#6B7280", bg: "rgba(107, 114, 128, 0.1)" }
}

export function AgentCard({
  agent,
  isMine,
  onClick,
  onViewDetails,
  onActivated,
  showActions = false,
  showCoOwners = false,
  showTopTraits = true,
  getAccessToken,
  className,
  index = 0,
  variant = "compact",
  labels = { 
    breed: "Criar", 
    viewDetails: "Ver Detalles", 
    active: "Activo", 
    inactive: "Off",
    activate: "Activar Monad",
    onChain: "On-Chain"
  },
}: AgentCardProps) {
  const traits = agent.traits as Record<string, number>
  const rarity = getRarity(traits)
  const topTraits = getTopTraits(traits, variant === "compact" ? 1 : 3)
  const topTrait = topTraits[0]
  const TopIcon = topTrait ? traitIcons[topTrait.key] : Dna
  const topColor = topTrait ? traitColors[topTrait.key] : "#7B3FE4"
  
  const isOnChain = !!agent.tokenId
  
  // Activation state
  const [activating, setActivating] = useState(false)
  const [activationStatus, setActivationStatus] = useState<"idle" | "signing" | "confirming" | "done" | "error">("idle")
  const { registerAsync } = useRegisterAgent()
  
  const handleActivate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (activating || !agent.dnaHash) return
    
    try {
      setActivating(true)
      setActivationStatus("signing")
      
      // Generate DNA commitment from hash
      const dnaCommitment = (agent.commitment || `0x${agent.dnaHash}`) as `0x${string}`
      
      // Register on-chain
      const { txHash, tokenId } = await registerAsync(dnaCommitment)
      setActivationStatus("confirming")
      
      // Update in our API
      if (getAccessToken) {
        const token = await getAccessToken()
        if (token) {
          await fetch(`/api/agents/${agent.id}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ txHash, tokenId }),
          })
        }
      }
      
      setActivationStatus("done")
      onActivated?.(tokenId || "", txHash || "")
      
      // Reload page to show updated state
      setTimeout(() => window.location.reload(), 2000)
      
    } catch (err) {
      console.error("Activation error:", err)
      setActivationStatus("error")
      setTimeout(() => {
        setActivating(false)
        setActivationStatus("idle")
      }, 3000)
    }
  }
  
  const getActivateButtonContent = () => {
    switch (activationStatus) {
      case "signing":
        return (<><Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />Firmando...</>)
      case "confirming":
        return (<><Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />Confirmando...</>)
      case "done":
        return (<><Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />¡Activado!</>)
      case "error":
        return (<><Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />Error - Reintentar</>)
      default:
        return (<><Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{labels.activate}</>)
    }
  }

  if (variant === "compact") {
    return (
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
        <Card className={cn("cursor-pointer transition-all hover:border-primary/50", agent.isActive && "ring-1 ring-emerald-500/20", className)} onClick={onClick}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="text-white text-sm font-medium" style={{ background: `linear-gradient(135deg, ${topColor}, hsl(var(--primary)))` }}>
                  {agent.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{agent.name}</h4>
                <p className="text-xs text-muted-foreground">Gen {agent.generation}</p>
              </div>
              {isMine && <Badge variant="outline" className="text-xs shrink-0">Yours</Badge>}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {topTrait && (
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${topColor}20` }}>
                  <TopIcon className="h-3.5 w-3.5" style={{ color: topColor }} />
                </div>
                <div className="flex-1">
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${topTrait.value}%`, backgroundColor: topColor }} />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{topTrait.value}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1"><Badge variant="outline" style={{ borderColor: rarity.color, color: rarity.color }}>{rarity.label}</Badge>{agent.tokenId && <Badge variant="outline" className="text-[10px]" style={{ borderColor: "#F97316", color: "#F97316" }}><Link2 className="w-3 h-3 mr-0.5" />On-Chain</Badge>}</div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{agent.fitness.toFixed(1)}</span>
            </div>
            {agent.isActive && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-500">Online</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Full variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
    >
      <Card className={cn("cursor-pointer transition-all hover:border-primary/50", className)} onClick={onClick}>
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold truncate">{agent.name}</h3>
              {agent.botUsername && <p className="text-xs sm:text-sm truncate text-muted-foreground">@{agent.botUsername}</p>}
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{agent.fitness.toFixed(1)}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">FITNESS</div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <Badge variant="outline" className="text-[10px] sm:text-xs" style={{ borderColor: rarity.color, color: rarity.color }}>
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />{rarity.label}
            </Badge>
            <Badge variant="secondary" className="text-[10px] sm:text-xs">Gen {agent.generation}</Badge>
            <Badge variant="outline" className={cn("text-[10px] sm:text-xs", agent.isActive ? "border-emerald-500 text-emerald-500" : "border-red-500 text-red-500")}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${agent.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
              {agent.isActive ? labels.active : labels.inactive}
            </Badge>
            {agent.tokenId && (
              <Badge variant="outline" className="text-[10px] sm:text-xs" style={{ borderColor: "#F97316", color: "#F97316" }}>
                <Link2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />On-Chain
              </Badge>
            )}
          </div>

          {/* Co-owners */}
          {showCoOwners && getAccessToken && (
            <div className="mb-3 sm:mb-4">
              <CoOwnersDisplay agentId={agent.id} variant="full" getAccessToken={getAccessToken} />
            </div>
          )}

          {/* Top Traits */}
          {showTopTraits && topTraits.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <p className="text-[10px] sm:text-xs mb-1.5 sm:mb-2 text-muted-foreground">TOP TRAITS</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {topTraits.map((trait) => {
                  const Icon = traitIcons[trait.key]
                  const color = traitColors[trait.key]
                  return (
                    <span key={trait.key} className="text-[10px] sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex items-center gap-1" style={{ backgroundColor: `${color}15`, color }}>
                      <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{trait.value}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* DNA Hash */}
          {(agent.commitment || agent.dnaHash) && (
            <div className="pt-3 sm:pt-4 border-t border-border">
              <code className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                {(agent.commitment || agent.dnaHash || "").slice(0, 20)}...
              </code>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="mt-3 sm:mt-4 flex gap-2">
              <Button size="sm" className="flex-1 text-xs sm:text-sm" onClick={(e) => { e.stopPropagation(); onViewDetails?.(); }}>
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{labels.viewDetails}
              </Button>
              
              {/* Activate on Monad Button - Orange if not on-chain */}
              {!isOnChain && agent.dnaHash && (
                <Button 
                  size="sm" 
                  className={cn(
                    "flex-1 text-xs sm:text-sm text-white",
                    activationStatus === "done" ? "bg-emerald-500" :
                    activationStatus === "error" ? "bg-red-500 hover:bg-red-600" :
                    "bg-orange-500 hover:bg-orange-600"
                  )}
                  onClick={handleActivate}
                  disabled={activating && activationStatus !== "error"}
                >
                  {getActivateButtonContent()}
                </Button>
              )}
              
              {/* If on-chain, show breed button */}
              {isOnChain && (
                <Link href={`/breeding?parentA=${agent.id}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="secondary" size="sm" className="w-full text-xs sm:text-sm">
                    <Dna className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{labels.breed}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default AgentCard
