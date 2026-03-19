// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";

interface Agent {
  id: string;
  name: string;
  botUsername: string | null;
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

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents/register-skill");
      const data = await res.json();
      if (data.agents) {
        setAgents(data.agents);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const getTraitBar = (value: number) => {
    const width = Math.min(100, Math.max(0, value));
    const color = value >= 80 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : "bg-red-500";
    return (
      <div className="w-full bg-gray-700 rounded h-2">
        <div className={`${color} h-2 rounded`} style={{ width: `${width}%` }} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-2xl">🧬 Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🧬 Genomad Dashboard</h1>
          <p className="text-gray-400">Registered Agents: {agents.length}</p>
          <button 
            onClick={fetchAgents}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
          >
            🔄 Refresh
          </button>
        </header>

        {error && (
          <div className="bg-red-900 border border-red-500 rounded p-4 mb-8">
            Error: {error}
          </div>
        )}

        {agents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🥚</div>
            <h2 className="text-2xl mb-2">No agents registered yet</h2>
            <p className="text-gray-400">Use the genomad-verify skill to register your first agent!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <div 
                key={agent.id} 
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{agent.name}</h2>
                    {agent.botUsername && (
                      <p className="text-gray-400 text-sm">@{agent.botUsername}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-400">
                      {agent.fitness.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">FITNESS</div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                    Gen {agent.generation}
                  </span>
                  <span className={`text-xs ml-2 px-2 py-1 rounded ${agent.isActive ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                    {agent.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-20">🔧 Tech</span>
                    {getTraitBar(agent.traits.technical)}
                    <span className="w-8 text-right">{agent.traits.technical}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20">🎨 Create</span>
                    {getTraitBar(agent.traits.creativity)}
                    <span className="w-8 text-right">{agent.traits.creativity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20">💬 Social</span>
                    {getTraitBar(agent.traits.social)}
                    <span className="w-8 text-right">{agent.traits.social}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20">📊 Analysis</span>
                    {getTraitBar(agent.traits.analysis)}
                    <span className="w-8 text-right">{agent.traits.analysis}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20">❤️ Empathy</span>
                    {getTraitBar(agent.traits.empathy)}
                    <span className="w-8 text-right">{agent.traits.empathy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20">📈 Trading</span>
                    {getTraitBar(agent.traits.trading)}
                    <span className="w-8 text-right">{agent.traits.trading}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20">📚 Teach</span>
                    {getTraitBar(agent.traits.teaching)}
                    <span className="w-8 text-right">{agent.traits.teaching}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20">👑 Lead</span>
                    {getTraitBar(agent.traits.leadership)}
                    <span className="w-8 text-right">{agent.traits.leadership}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 font-mono truncate">
                    DNA: {agent.dnaHash.slice(0, 16)}...
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(agent.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
