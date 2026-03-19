"use client"
import { DashboardSkeleton, AgentCardSkeleton, StatsCardSkeleton } from "@/components/skeletons";
export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import dynamicImport from "next/dynamic"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import { 
  Dna, Sparkles, Users, ArrowRight, Globe, Star, Activity, Zap,
  Cpu, Palette, MessageSquare, Brain, Heart, TrendingUp, GraduationCap, Crown,
} from "lucide-react"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button-shadcn"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { AgentCard } from "@/components/agent-card"
import { StatsCard } from "@/components/stats-card"
import { AppSidebar } from "@/components/app-sidebar"
import { LoginButton } from "@/components/LoginButton"
import { NetworkSwitcher } from "@/components/NetworkSwitcher"
// Lazy load heavy components
const ActivityChart = dynamicImport(
  () => import("@/components/activity-chart").then(mod => ({ default: mod.ActivityChart })),
  { ssr: false, loading: () => <div className="h-[280px] bg-card rounded-xl animate-pulse" /> }
)
const RequestBreedingModal = dynamicImport(
  () => import("@/components/RequestBreedingModal").then(mod => ({ default: mod.RequestBreedingModal })),
  { ssr: false }
)

interface Agent {
  id: string
  name: string
  botUsername: string | null
  traits: {
    technical: number; creativity: number; social: number; analysis: number
    empathy: number; trading: number; teaching: number; leadership: number
  }
  fitness: number
  generation: number
  isActive: boolean
  owner?: { wallet: string | null } | null
  isMine?: boolean
}



// Features for non-authenticated view
const features = [
  { icon: Dna, title: "Unique DNA", titleEs: "DNA Único", desc: "8 traits define personality", descEs: "8 traits definen personalidad", color: "hsl(var(--primary))" },
  { icon: Sparkles, title: "Evolution", titleEs: "Evolución", desc: "Improve each generation", descEs: "Mejora cada generación", color: "hsl(var(--secondary))" },
  { icon: Users, title: "Breeding", titleEs: "Breeding", desc: "Combine agents", descEs: "Combina agentes", color: "hsl(var(--accent))" },
  { icon: TrendingUp, title: "Profitability", titleEs: "Rentabilidad", desc: "Earn by renting", descEs: "Gana rentando", color: "#F59E0B" },
]

export default function DashboardPage() {
  const { i18n } = useTranslation()
  const { ready, authenticated, getAccessToken } = usePrivy()
  const router = useRouter()
  const [globalAgents, setGlobalAgents] = useState<Agent[]>([])
  const [myAgents, setMyAgents] = useState<Agent[]>([])
  const [stats, setStats] = useState({ totalAgents: 0, activeAgents: 0, totalBreedings: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showBreedingModal, setShowBreedingModal] = useState(false)
  
  const isEs = i18n.language === "es"

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Parallel fetching for better performance
      const token = authenticated ? await getAccessToken() : null
      
      const [statsRes, agentsRes, myRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/leaderboard?limit=12"),
        token ? fetch("/api/agents/available", { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null)
      ])
      
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats({
          totalAgents: data.totalAgents || 0,
          activeAgents: data.activeAgents || 0,
          totalBreedings: data.totalBreedings || 0,
        })
      }
      
      if (agentsRes.ok) {
        const data = await agentsRes.json()
        setGlobalAgents(data.agents || [])
      }
      
      if (myRes?.ok) {
        const myData = await myRes.json()
        setMyAgents(myData.myAgents || [])
      }
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }, [authenticated, getAccessToken])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Loading state
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Dna className="w-10 h-10 animate-pulse text-primary" />
      </div>
    )
  }

  // Non-authenticated view (landing-style)
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 md:py-20">
          <motion.div className="text-center mb-10 sm:mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border border-border bg-card"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.2 }}
            >
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Built on Monad</span>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">{isEs ? "Evoluciona tu " : "Evolve your "}</span>
              <span className="gradient-text">{isEs ? "Agente AI" : "AI Agent"}</span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-muted-foreground">
              {isEs 
                ? "El primer protocolo de breeding de agentes AI on-chain. Crea, evoluciona y comercia agentes únicos."
                : "The first on-chain AI agent breeding protocol. Create, evolve, and trade unique agents."}
            </p>
            <LoginButton />
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.5 }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div 
                  key={feature.title} 
                  className="p-5 sm:p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">{isEs ? feature.titleEs : feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{isEs ? feature.descEs : feature.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Global Agents Preview */}
          <motion.div 
            className="rounded-xl p-5 sm:p-6 md:p-8 bg-card border border-border"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                {isEs ? "Agentes Globales" : "Global Agents"}
              </h3>
              <span className="text-sm text-muted-foreground">
                {globalAgents.length} {isEs ? "agentes activos" : "active agents"}
              </span>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <Dna className="w-8 h-8 mx-auto animate-pulse text-primary" />
              </div>
            ) : globalAgents.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">{isEs ? "Sé el primero en conectar tu agente" : "Be the first to connect your agent"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {globalAgents.slice(0, 8).map((agent, index) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    variant="compact"
                    index={index}
                    labels={{ active: "Online", inactive: "Off" }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  // Authenticated view with sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <NetworkSwitcher />
        </header>
        <main className="flex-1 p-4 lg:p-6 min-w-0">
          <div className="space-y-6 min-w-0">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {isEs ? "Bienvenido a" : "Welcome to"} <span className="gradient-text">Genomad</span>
              </h1>
              <p className="text-muted-foreground">
                {isEs ? "Tu centro de control para agentes AI evolutivos" : "Your control center for evolutionary AI agents"}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatsCard
                title={isEs ? "Agentes Globales" : "Global Agents"}
                value={stats.totalAgents}
                trend={{ value: 12.5, isPositive: true }}
                description={isEs ? "Creciendo este mes" : "Trending up this month"}
                icon={<Globe className="h-4 w-4 text-primary" />}
              />
              <StatsCard
                title={isEs ? "Online Ahora" : "Online Now"}
                value={stats.activeAgents}
                description={isEs ? "Agentes activos" : "Active agents"}
                icon={<Activity className="h-4 w-4 text-emerald-500" />}
              />
              <StatsCard
                title="Breedings"
                value={stats.totalBreedings}
                trend={{ value: 8, isPositive: true }}
                description={isEs ? "Nuevas combinaciones" : "New combinations"}
                icon={<Dna className="h-4 w-4 text-accent" />}
              />
            </div>

            {/* Activity Chart */}
            <ActivityChart className="col-span-full" />

            {/* Quick Actions */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                    <Dna className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base truncate">{isEs ? "Vincula tu Agente" : "Link Your Agent"}</CardTitle>
                    <CardDescription>
                      {isEs ? "Conecta tu agente OpenClaw" : "Connect your OpenClaw agent"}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/profile">
                      {isEs ? "Ir a Profile" : "Go to Profile"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-accent/20 hover:border-accent/40 transition-colors">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base truncate">{isEs ? "Iniciar Breeding" : "Start Breeding"}</CardTitle>
                    <CardDescription>
                      {isEs ? "Combina agentes para crear nuevos" : "Combine agents to create new ones"}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" asChild>
                    <Link href="/breeding">
                      {isEs ? "Explorar" : "Explore"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Agents Grid */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-secondary" />
                    {isEs ? "Agentes en Genomad" : "Agents in Genomad"}
                  </CardTitle>
                  <CardDescription>
                    {globalAgents.filter(a => a.isActive).length} online
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/agents">{isEs ? "Ver todos" : "View all"}</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="p-4 rounded-xl border border-border">
                        <div className="flex items-center gap-3 mb-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ))}
                  </div>
                ) : globalAgents.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {isEs ? "Sé el primero en conectar tu agente" : "Be the first to connect your agent"}
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href="/profile">{isEs ? "Conectar Agente" : "Connect Agent"}</Link>
                    </Button>
                  </div>
                ) : (
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {globalAgents.map((agent) => {
                      const isMine = myAgents.some(m => m.id === agent.id)
                      return (
                        <AgentCard
                          key={agent.id}
                          agent={agent}
                          isMine={isMine}
                          variant="compact"
                          onClick={() => {
                            if (!isMine) {
                              setSelectedAgent(agent)
                              setShowBreedingModal(true)
                            }
                          }}
                          labels={{ active: "Online", inactive: "Off" }}
                        />
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Breeding Modal */}
          <RequestBreedingModal
            isOpen={showBreedingModal}
            onClose={() => {
              setShowBreedingModal(false)
              setSelectedAgent(null)
            }}
            targetAgent={selectedAgent}
            myAgents={myAgents}
            getAccessToken={getAccessToken}
            onSuccess={fetchData}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
