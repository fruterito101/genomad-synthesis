// src/app/agents/page.tsx
// Dashboard público de agentes registrados

"use client";

import { useEffect, useState } from "react";

interface Agent {
  id: string;
  name: string;
  botUsername?: string;
  dnaHash: string;
  traits: {
    technical: number;
    creativity: number;
    social: number;
    analysis: number;
    empathy: number;
    trading: number;
    teaching: number;
    leadership: number;
  };
  fitness: number;
  generation: number;
  isActive: boolean;
  createdAt: string;
}

function TraitBar({ name, value }: { name: string; value: number }) {
  const emoji: Record<string, string> = {
    technical: "💻",
    creativity: "🎨",
    social: "🤝",
    analysis: "📊",
    empathy: "💜",
    trading: "📈",
    teaching: "📚",
    leadership: "👑",
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-6">{emoji[name] || "•"}</span>
      <span className="w-20 text-zinc-400">{name}</span>
      <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right text-zinc-300">{value}</span>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{agent.name}</h3>
          {agent.botUsername && (
            <p className="text-zinc-500 text-sm">@{agent.botUsername}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-400">
            {agent.fitness.toFixed(1)}
          </div>
          <div className="text-xs text-zinc-500">FITNESS</div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">
          Gen {agent.generation}
        </span>
        <span className={`px-2 py-1 rounded ${agent.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
          {agent.isActive ? "🟢 Online" : "⚫ Offline"}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {Object.entries(agent.traits).map(([name, value]) => (
          <TraitBar key={name} name={name} value={value} />
        ))}
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-600 font-mono">
          🧬 {agent.dnaHash.slice(0, 16)}...
        </p>
        <p className="text-xs text-zinc-600 mt-1">
          Registrado: {new Date(agent.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/agents/register-skill")
      .then(res => res.json())
      .then(data => {
        setAgents(data.agents || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const refresh = () => {
    setLoading(true);
    fetch("/api/agents/register-skill")
      .then(res => res.json())
      .then(data => {
        setAgents(data.agents || []);
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">🧬 Genomad Agents</h1>
            <p className="text-zinc-400 mt-2">
              {agents.length} agentes registrados
            </p>
          </div>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-colors"
          >
            🔄 Actualizar
          </button>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="text-4xl animate-pulse">🧬</div>
            <p className="text-zinc-500 mt-4">Cargando agentes...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
            Error: {error}
          </div>
        )}

        {!loading && agents.length === 0 && (
          <div className="text-center py-20 bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold mb-2">No hay agentes registrados</h2>
            <p className="text-zinc-500 max-w-md mx-auto">
              Instala el skill <code className="text-emerald-400">genomad-verify</code> en tu bot 
              y ejecuta <code className="text-emerald-400">/genomad-verify</code> para registrar tu agente.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}
