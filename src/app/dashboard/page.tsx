"use client";

import { useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { 
  Dna, Sparkles, Users, ArrowRight, Globe, Activity, Zap,
  Bot, Plus, Settings, LogOut
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  traits: Record<string, number>;
  fitness: number;
  generation: number;
  tokenId: string | null;
  isActive: boolean;
}

interface Stats {
  totalAgents: number;
  activeAgents: number;
  totalBreedings: number;
}

function TraitBar({ name, value }: { name: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-14 capitalize truncate">{name}</span>
      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-6 text-right">{value}</span>
    </div>
  );
}

function AgentCard({ agent, isMine }: { agent: Agent; isMine?: boolean }) {
  const topTraits = Object.entries(agent.traits)
    .filter(([k]) => k !== 'skillCount')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="card p-4 group hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{agent.name}</h3>
            <p className="text-xs text-muted-foreground">Gen {agent.generation}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isMine && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">Mine</span>
          )}
          {agent.tokenId && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-500">
              #{agent.tokenId}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-muted/30">
        <Zap className="w-3 h-3 text-primary" />
        <span className="text-xs text-muted-foreground">Fitness</span>
        <span className="ml-auto text-sm font-mono font-semibold">{agent.fitness.toFixed(1)}</span>
      </div>

      <div className="space-y-1.5">
        {topTraits.map(([name, value]) => (
          <TraitBar key={name} name={name} value={value} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: typeof Globe; 
  label: string; 
  value: number; 
  color: string; 
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<Stats>({ totalAgents: 0, activeAgents: 0, totalBreedings: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = authenticated ? await getAccessToken() : null;

      const [statsRes, agentsRes, myRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/agents/public?limit=12"),
        token ? fetch("/api/agents/available", { headers: { Authorization: `Bearer ${token}` } }) : null,
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats({
          totalAgents: data.totalAgents || 0,
          activeAgents: data.activeAgents || 0,
          totalBreedings: data.totalBreedings || 0,
        });
      }

      if (agentsRes.ok) {
        const data = await agentsRes.json();
        setAgents(data.agents || []);
      }

      if (myRes?.ok) {
        const data = await myRes.json();
        setMyAgents(data.myAgents || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Dna className="w-10 h-10 animate-pulse text-primary" />
      </div>
    );
  }

  // Non-authenticated view
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Manage</span> your agents
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Connect your wallet to view your agents, start breeding, and track your portfolio.
            </p>
            <button onClick={login} className="btn-primary flex items-center gap-2 mx-auto">
              Connect Wallet
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Preview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard 
              icon={Globe} 
              label="Total Agents" 
              value={stats.totalAgents} 
              color="bg-primary/10 text-primary" 
            />
            <StatCard 
              icon={Activity} 
              label="Active Now" 
              value={stats.activeAgents} 
              color="bg-green-500/10 text-green-500" 
            />
            <StatCard 
              icon={Dna} 
              label="Breedings" 
              value={stats.totalBreedings} 
              color="bg-accent/10 text-accent" 
            />
          </div>

          {/* Preview Agents */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Active Agents</h2>
              <span className="text-sm text-muted-foreground">{agents.length} agents</span>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card p-4 animate-pulse">
                    <div className="h-8 bg-muted rounded mb-3" />
                    <div className="h-10 bg-muted rounded mb-3" />
                    <div className="space-y-2">
                      <div className="h-2 bg-muted rounded" />
                      <div className="h-2 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {agents.slice(0, 8).map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Authenticated view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Dna className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Genomad</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
            </Link>
            <button onClick={logout} className="p-2 text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Welcome to <span className="gradient-text">Genomad</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your agents, start breeding, and track evolution.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={Globe} 
            label="Total Agents" 
            value={stats.totalAgents} 
            color="bg-primary/10 text-primary" 
          />
          <StatCard 
            icon={Activity} 
            label="Active Now" 
            value={stats.activeAgents} 
            color="bg-green-500/10 text-green-500" 
          />
          <StatCard 
            icon={Dna} 
            label="Breedings" 
            value={stats.totalBreedings} 
            color="bg-accent/10 text-accent" 
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/profile" className="card p-6 group hover:border-primary/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Link Your Agent</h3>
                <p className="text-sm text-muted-foreground">Connect your OpenClaw agent to Genomad</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          <Link href="/breeding" className="card p-6 group hover:border-accent/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Start Breeding</h3>
                <p className="text-sm text-muted-foreground">Combine agents to create offspring</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
          </Link>
        </div>

        {/* My Agents */}
        {myAgents.length > 0 && (
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                My Agents
              </h2>
              <span className="text-sm text-muted-foreground">{myAgents.length} agents</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {myAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} isMine />
              ))}
            </div>
          </div>
        )}

        {/* All Agents */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-secondary" />
              All Agents
            </h2>
            <Link href="/agents" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-8 bg-muted rounded mb-3" />
                  <div className="h-10 bg-muted rounded mb-3" />
                  <div className="space-y-2">
                    <div className="h-2 bg-muted rounded" />
                    <div className="h-2 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {agents.map((agent) => {
                const isMine = myAgents.some((m) => m.id === agent.id);
                return <AgentCard key={agent.id} agent={agent} isMine={isMine} />;
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
