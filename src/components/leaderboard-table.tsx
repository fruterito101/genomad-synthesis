"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui"
import { Badge } from "@/components/ui"
import { Avatar, AvatarFallback } from "@/components/ui"
import { 
  Crown, Medal, Award, Link2,
  Cpu, Palette, MessageSquare, Brain, Heart, TrendingUp, GraduationCap
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Agent {
  id: string
  name: string
  fitness: number
  generation: number
  traits: Record<string, number>
  isActive?: boolean
  tokenId?: string | null
}

interface LeaderboardTableProps {
  agents: Agent[]
  onAgentClick?: (agent: Agent) => void
}

const traitConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  technical: { icon: Cpu, color: "#3B82F6", label: "Technical" },
  creativity: { icon: Palette, color: "#EC4899", label: "Creative" },
  social: { icon: MessageSquare, color: "#8B5CF6", label: "Social" },
  analysis: { icon: Brain, color: "#06B6D4", label: "Analysis" },
  empathy: { icon: Heart, color: "#EF4444", label: "Empathy" },
  trading: { icon: TrendingUp, color: "#F97316", label: "Trading" },
  teaching: { icon: GraduationCap, color: "#F59E0B", label: "Teaching" },
  leadership: { icon: Crown, color: "#F97316", label: "Leadership" },
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-500" />
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />
    default:
      return <span className="text-muted-foreground font-mono">#{rank}</span>
  }
}

function getTopTrait(traits: Record<string, number>) {
  const entries = Object.entries(traits)
  if (entries.length === 0) return null
  const [key, value] = entries.sort(([,a], [,b]) => b - a)[0]
  const config = traitConfig[key]
  return config ? { key, value, ...config } : null
}

function getRarity(traits: Record<string, number>) {
  const avg = Object.values(traits).reduce((a, b) => a + b, 0) / Math.max(Object.values(traits).length, 1)
  if (avg >= 80) return { label: "Legendary", color: "#F59E0B" }
  if (avg >= 65) return { label: "Epic", color: "#8B5CF6" }
  if (avg >= 50) return { label: "Rare", color: "#3B82F6" }
  return { label: "Common", color: "#6B7280" }
}

export function LeaderboardTable({ agents, onAgentClick }: LeaderboardTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">Rank</TableHead>
          <TableHead>Agent</TableHead>
          <TableHead>Top Trait</TableHead>
          <TableHead>Generation</TableHead>
          <TableHead className="text-right">Fitness</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {agents.map((agent, index) => {
          const rank = index + 1
          const topTrait = getTopTrait(agent.traits)
          const rarity = getRarity(agent.traits)
          const TraitIcon = topTrait?.icon
          
          return (
            <TableRow 
              key={agent.id}
              className={cn(
                "cursor-pointer transition-colors",
                rank <= 3 && "bg-muted/30"
              )}
              onClick={() => onAgentClick?.(agent)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(rank)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback 
                      className="text-xs font-semibold text-white"
                      style={{ 
                        background: `linear-gradient(135deg, ${topTrait?.color || '#7B3FE4'}, var(--color-accent))` 
                      }}
                    >
                      {agent.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <Badge 
                      variant="outline" 
                      className="text-[10px] px-1.5 py-0"
                      style={{ borderColor: rarity.color, color: rarity.color }}
                    >
                      {rarity.label}
                    </Badge>
                    {agent.tokenId && (
                      <Badge 
                        variant="outline" 
                        className="text-[10px] px-1.5 py-0 ml-1"
                        style={{ borderColor: "#F97316", color: "#F97316" }}
                      >
                        <Link2 className="w-3 h-3 mr-1" />On-Chain
                        On-Chain
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {topTrait && TraitIcon && (
                  <div className="flex items-center gap-2">
                    <TraitIcon className="h-4 w-4" style={{ color: topTrait.color }} />
                    <span className="text-sm" style={{ color: topTrait.color }}>
                      {topTrait.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({topTrait.value.toFixed(0)})
                    </span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">Gen {agent.generation}</span>
              </TableCell>
              <TableCell className="text-right">
                <span 
                  className="text-lg font-bold"
                  style={{ color: rarity.color }}
                >
                  {agent.fitness.toFixed(1)}
                </span>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default LeaderboardTable
