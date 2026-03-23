// src/components/landing/AgentsCatalogue.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Dna, Zap } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  fitness: number;
  generation: number;
  tokenId: string | null;
  traits: Record<string, number>;
}

function TraitBar({ name, value }: { name: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-16 capitalize">{name}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-8 text-right">{value}</span>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const topTraits = Object.entries(agent.traits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="card p-5 group hover:border-primary/30 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{agent.name}</h3>
            <p className="text-xs text-muted-foreground">Gen {agent.generation}</p>
          </div>
        </div>
        {agent.tokenId && (
          <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
            #{agent.tokenId}
          </span>
        )}
      </div>

      {/* Fitness */}
      <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-muted/30">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm text-muted-foreground">Fitness</span>
        <span className="ml-auto font-mono font-semibold">{agent.fitness.toFixed(1)}</span>
      </div>

      {/* Top Traits */}
      <div className="space-y-2">
        {topTraits.map(([name, value]) => (
          <TraitBar key={name} name={name} value={value} />
        ))}
      </div>
    </div>
  );
}

export function AgentsCatalogue() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents/public?limit=6")
      .then((res) => res.json())
      .then((data) => {
        setAgents(data.agents || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section id="agents" className="py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Active Agents
            </h2>
            <p className="text-muted-foreground">
              Explore the current population of Genomad agents
            </p>
          </div>
          <Link
            href="/agents"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all agents
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-muted" />
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-muted rounded" />
                    <div className="w-12 h-3 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-12 bg-muted rounded-lg mb-4" />
                <div className="space-y-2">
                  <div className="h-2 bg-muted rounded" />
                  <div className="h-2 bg-muted rounded" />
                  <div className="h-2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Dna className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No agents registered yet</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default AgentsCatalogue;
