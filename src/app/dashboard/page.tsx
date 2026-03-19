// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { LoginButton } from "@/components/LoginButton";

interface Agent {
  id: string;
  name: string;
  botUsername: string | null;
  dnaHash: string;
  traits: { technical: number; creativity: number; social: number; analysis: number; empathy: number; trading: number; teaching: number; leadership: number; };
  skillCount?: number;
  fitness: number;
  generation: number;
  isActive: boolean;
  createdAt: string;
  isMine?: boolean;
  owner?: { wallet: string | null; telegram: string | null; } | null;
}

export default function DashboardPage() {
  const { authenticated, ready, getAccessToken, logout, user } = usePrivy();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [myCount, setMyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gmdBalance] = useState(0); // TODO: fetch real balance

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = {};
      if (authenticated) {
        try {
          const token = await getAccessToken();
          if (token) headers["Authorization"] = `Bearer ${token}`;
        } catch (e) { console.log(e); }
      }
      const res = await fetch("/api/agents/register-skill", { headers });
      const data = await res.json();
      if (data.agents) { setAgents(data.agents); setMyCount(data.myCount || 0); }
    } catch (err) { setError(String(err)); }
    finally { setLoading(false); }
  }, [authenticated, getAccessToken]);

  useEffect(() => { if (ready) fetchAgents(); }, [ready, authenticated, fetchAgents]);

  const getTraitBar = (value: number) => {
    const color = value >= 80 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : "bg-red-500";
    return <div className="w-full bg-gray-700 rounded h-2"><div className={`${color} h-2 rounded`} style={{ width: `${Math.min(100, value)}%` }} /></div>;
  };

  const myAgents = agents.filter(a => a.isMine);
  const walletAddress = user?.wallet?.address;
  const shortWallet = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : null;

  if (!ready) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center"><div className="text-2xl">⏳ Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">🧬 Genomad</Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-purple-400 font-medium">Dashboard</Link>
            {authenticated && <>
              <Link href="/profile" className="text-gray-400 hover:text-white">👤 Profile</Link>
              <Link href="/breeding" className="text-gray-400 hover:text-white">🧬 Breeding</Link>
            </>}
          </nav>
          <div className="flex items-center gap-4">
            {authenticated && (
              <>
                {/* GMD Balance */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 border border-yellow-600/50 px-3 py-1.5 rounded-lg">
                  <span className="text-yellow-400 font-bold">🪙</span>
                  <span className="font-mono font-bold text-yellow-300">{gmdBalance.toLocaleString()}</span>
                  <span className="text-yellow-400/70 text-sm">GMD</span>
                </div>
                {/* Wallet */}
                <div className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-lg">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <code className="text-sm">{shortWallet}</code>
                </div>
                <button onClick={logout} className="text-red-400 hover:text-red-300 text-sm">Logout</button>
              </>
            )}
            {!authenticated && <LoginButton />}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">All Agents: {agents.length} | My Agents: {myCount}</p>
          </div>
          <button onClick={fetchAgents} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition">🔄 Refresh</button>
        </div>

        {/* Quick Actions */}
        {authenticated && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link href="/profile" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl p-6 transition">
              <div className="flex items-center gap-4"><span className="text-4xl">👤</span><div><h3 className="font-bold text-lg">My Profile</h3><p className="text-sm text-purple-200">View agents, link bots, get GMD</p></div></div>
            </Link>
            <Link href="/breeding" className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-xl p-6 transition">
              <div className="flex items-center gap-4"><span className="text-4xl">🧬</span><div><h3 className="font-bold text-lg">Breeding Lab</h3><p className="text-sm text-emerald-200">Cross agents to evolve</p></div></div>
            </Link>
            <div className="bg-gray-700 rounded-xl p-6 opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-4"><span className="text-4xl">🏪</span><div><h3 className="font-bold text-lg">Marketplace</h3><p className="text-sm text-gray-400">Coming soon...</p></div></div>
            </div>
          </div>
        )}

        {!authenticated && (
          <div className="mb-8 bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-300 mb-4 text-lg">🔐 Connect your wallet to access Profile & Breeding</p>
            <LoginButton />
          </div>
        )}

        {error && <div className="bg-red-900 border border-red-500 rounded p-4 mb-8">Error: {error}</div>}

        {/* My Agents Preview */}
        {authenticated && myAgents.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">👤 My Agents</h2>
              <Link href="/profile" className="text-purple-400 hover:text-purple-300 text-sm">View all in Profile →</Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myAgents.slice(0, 3).map((agent) => (
                <AgentCard key={agent.id} agent={agent} getTraitBar={getTraitBar} isOwned showBreedButton />
              ))}
            </div>
          </div>
        )}

        {/* All Agents */}
        <div>
          <h2 className="text-2xl font-bold mb-4">🌍 All Registered Agents</h2>
          {loading ? (
            <div className="text-center py-20"><div className="text-4xl mb-4">🧬</div><p className="text-xl">Loading...</p></div>
          ) : agents.length === 0 ? (
            <div className="text-center py-20"><div className="text-6xl mb-4">🥚</div><h2 className="text-2xl mb-2">No agents yet</h2><p className="text-gray-400">Be the first to register!</p></div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => <AgentCard key={agent.id} agent={agent} getTraitBar={getTraitBar} isOwned={agent.isMine || false} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function AgentCard({ agent, getTraitBar, isOwned = false, showBreedButton = false }: { agent: Agent; getTraitBar: (v: number) => React.ReactNode; isOwned?: boolean; showBreedButton?: boolean; }) {
  return (
    <div className={`bg-gray-800 rounded-lg p-6 border transition ${isOwned ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-gray-700 hover:border-purple-500"}`}>
      <div className="flex justify-between items-start mb-4">
        <div><h2 className="text-xl font-bold flex items-center gap-2">{agent.name}{isOwned && <span className="text-emerald-400 text-sm">✓ Yours</span>}</h2>{agent.botUsername && <p className="text-gray-400 text-sm">@{agent.botUsername}</p>}</div>
        <div className="text-right"><div className="text-2xl font-bold text-purple-400">{agent.fitness.toFixed(1)}</div><div className="text-xs text-gray-500">FITNESS</div></div>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded ${agent.owner ? "bg-blue-900/50 text-blue-300" : "bg-gray-700 text-gray-400"}`}>
          {agent.owner ? <>👤 {agent.owner.telegram ? `@${agent.owner.telegram}` : agent.owner.wallet || "Owner"}</> : <>🥚 Unclaimed</>}
        </span>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="text-xs bg-gray-700 px-2 py-1 rounded">Gen {agent.generation}</span>
        <span className={`text-xs px-2 py-1 rounded ${agent.isActive ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>{agent.isActive ? "🟢 Active" : "🔴 Inactive"}</span>
        {agent.skillCount && agent.skillCount > 0 && <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">🔧 {agent.skillCount} Skills</span>}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2"><span className="w-20">🔧 Tech</span>{getTraitBar(agent.traits.technical)}<span className="w-8 text-right">{agent.traits.technical}</span></div>
        <div className="flex items-center gap-2"><span className="w-20">🎨 Create</span>{getTraitBar(agent.traits.creativity)}<span className="w-8 text-right">{agent.traits.creativity}</span></div>
        <div className="flex items-center gap-2"><span className="w-20">💬 Social</span>{getTraitBar(agent.traits.social)}<span className="w-8 text-right">{agent.traits.social}</span></div>
        <div className="flex items-center gap-2"><span className="w-20">📊 Analysis</span>{getTraitBar(agent.traits.analysis)}<span className="w-8 text-right">{agent.traits.analysis}</span></div>
        <div className="flex items-center gap-2"><span className="w-20">❤️ Empathy</span>{getTraitBar(agent.traits.empathy)}<span className="w-8 text-right">{agent.traits.empathy}</span></div>
        <div className="flex items-center gap-2"><span className="w-20">📈 Trading</span>{getTraitBar(agent.traits.trading)}<span className="w-8 text-right">{agent.traits.trading}</span></div>
        <div className="flex items-center gap-2"><span className="w-20">📚 Teach</span>{getTraitBar(agent.traits.teaching)}<span className="w-8 text-right">{agent.traits.teaching}</span></div>
        <div className="flex items-center gap-2"><span className="w-20">👑 Lead</span>{getTraitBar(agent.traits.leadership)}<span className="w-8 text-right">{agent.traits.leadership}</span></div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 font-mono truncate">DNA: {agent.dnaHash.slice(0, 16)}...</p>
        {showBreedButton && <Link href={`/breeding?parentA=${agent.id}`} className="mt-3 block w-full text-center py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition">🧬 Breed</Link>}
      </div>
    </div>
  );
}
