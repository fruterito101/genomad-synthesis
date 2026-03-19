"use client"

import { motion } from "framer-motion"
import { 
  Cpu, Palette, MessageSquare, Brain, Heart, TrendingUp, GraduationCap, Crown 
} from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AgentCardProps {
  agent: {
    id: string
    name: string
    fitness: number
    generation: number
    isActive: boolean
    traits: {
      technical: number
      creativity: number
      social: number
      analysis: number
      empathy: number
      trading: number
      teaching: number
      leadership: number
    }
  }
  isMine?: boolean
  onClick?: () => void
  className?: string
}

const traitIcons: Record<string, React.ElementType> = {
  technical: Cpu,
  creativity: Palette,
  social: MessageSquare,
  analysis: Brain,
  empathy: Heart,
  trading: TrendingUp,
  teaching: GraduationCap,
  leadership: Crown,
}

const traitColors: Record<string, string> = {
  technical: "#3B82F6",
  creativity: "#EC4899",
  social: "#8B5CF6",
  analysis: "#06B6D4",
  empathy: "#EF4444",
  trading: "#10B981",
  teaching: "#F59E0B",
  leadership: "#F97316",
}

function getTopTrait(traits: AgentCardProps["agent"]["traits"]): { key: string; value: number } {
  const entries = Object.entries(traits)
  const top = entries.sort(([, a], [, b]) => b - a)[0]
  return { key: top[0], value: top[1] }
}

function getRarity(traits: AgentCardProps["agent"]["traits"]): { label: string; color: string } {
  const values = Object.values(traits)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const max = Math.max(...values)
  if (avg >= 80) return { label: "Legendary", color: "#FBBF24" }
  if (avg >= 75 || max >= 95) return { label: "Epic", color: "#A855F7" }
  if (avg >= 60 || max >= 85) return { label: "Rare", color: "#3B82F6" }
  return { label: "Uncommon", color: "#10B981" }
}

export function AgentCard({ agent, isMine, onClick, className }: AgentCardProps) {
  const rarity = getRarity(agent.traits)
  const topTrait = getTopTrait(agent.traits)
  const TopIcon = traitIcons[topTrait.key]
  const topColor = traitColors[topTrait.key]

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all hover:border-primary/50",
          agent.isActive && "ring-1 ring-emerald-500/20",
          className
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback
                className="text-white text-sm font-medium"
                style={{
                  background: `linear-gradient(135deg, ${topColor}, hsl(var(--primary)))`,
                }}
              >
                {agent.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{agent.name}</h4>
              <p className="text-xs text-muted-foreground">Gen {agent.generation}</p>
            </div>
            {isMine && (
              <Badge variant="outline" className="text-xs shrink-0">
                Yours
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Top trait indicator */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="h-6 w-6 rounded-md flex items-center justify-center"
              style={{ backgroundColor: `${topColor}20` }}
            >
              <TopIcon className="h-3.5 w-3.5" style={{ color: topColor }} />
            </div>
            <div className="flex-1">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${topTrait.value}%`,
                    backgroundColor: topColor,
                  }}
                />
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{topTrait.value}</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              style={{ borderColor: rarity.color, color: rarity.color }}
            >
              {rarity.label}
            </Badge>
            <span className="text-xl font-bold gradient-text">
              {agent.fitness.toFixed(1)}
            </span>
          </div>

          {/* Online indicator */}
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
