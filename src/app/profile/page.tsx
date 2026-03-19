// src/app/profile/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoginButton } from "@/components/LoginButton";

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
  commitment: string | null;
  tokenId: string | null;
}

function calculateRarity(traits: Agent["traits"]): { label: string; color: string } {
  const values = Object.values(traits);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  const spread = max - Math.min(...values);
  
  if (avg >= 80 && spread <= 20) return { label: "Legendary", color: "text-yellow-400" };
  if (avg >= 75 || max >= 95) return { label: "Epic", color: "text-purple-400" };
  if (avg >= 60 || max >= 85) return { label: "Rare", color: "text-blue-400" };
  if (avg >= 40) return { label: "Uncommon", color: "text-green-400" };
  return { label: "Common", color: "text-gray-400" };
}

function getTopTraits(traits: Agent["traits"]): string[] {
  const emojis: Record<string, string> = {
    technical: "💻 Tech", creativity: "🎨 Creative", social: "💬 Social",
    analysis: "📊 Analyst", empathy: "❤️ Empath", trading: "📈 Trader",
    teaching: "📚 Teacher", leadership: "👑 Leader",
  };
  return Object.entries(traits).sort(([, a], [, b]) => b - a).slice(0, 3).map(([key]) => emojis[key] || key);
}

export default function ProfilePage() {
  const { authenticated, ready, user, getAccessToken, logout } = usePrivy();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [gmdBalance, setGmdBalance] = useState<number>(0);
  
  // Verification code state
  const [generatingCode, setGeneratingCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!authenticated) return;
    try {
      setLoading(true);
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch("/api/agents", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
      }
      // TODO: Fetch GMD balance when token is created
      setGmdBalance(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    if (ready && !authenticated) router.push("/dashboard");
    else if (ready && authenticated) fetchProfile();
  }, [ready, authenticated, router, fetchProfile]);

  const generateCode = async () => {
    setGeneratingCode(true);
    setCodeError(null);
    setVerificationCode(null);
    try {
      const token = await getAccessToken();
      if (!token) { setCodeError("Please login first"); return; }
      const res = await fetch("/api/codes/generate", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok) { setCodeError(data.error || "Failed"); return; }
      setVerificationCode(data.code);
      setCodeExpiry(new Date(data.expiresAt));
    } catch (err) {
      setCodeError(String(err));
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyCode = () => verificationCode && navigator.clipboard.writeText(verificationCode);

  const formatTimeLeft = () => {
    if (!codeExpiry) return "";
    const diff = codeExpiry.getTime() - Date.now();
    if (diff <= 0) return "Expired";
    return `${Math.floor(diff / 60000)}:${String(Math.floor((diff % 60000) / 1000)).padStart(2, "0")}`;
  };

  const walletAddress = user?.wallet?.address;
  const shortWallet = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Not connected";

  if (!ready) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center"><div className="text-2xl">⏳ Loading...</div></div>;
  }

  if (!authenticated) {
    return <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-4"><h1 className="text-2xl">🔒 Please connect your wallet</h1><LoginButton /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold">🧬 Genomad</Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link>
            <Link href="/profile" className="text-purple-400 font-medium">👤 Profile</Link>
            <Link href="/breeding" className="text-gray-400 hover:text-white">🧬 Breeding</Link>
          </nav>
          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl">👤</div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center text-xs">✓</div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{shortWallet}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">💎 <code className="bg-gray-800 px-2 py-0.5 rounded">{walletAddress?.slice(0, 10)}...</code></span>
                <span className="flex items-center gap-1">📅 Joined recently</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-center">
              <div><div className="text-3xl font-bold text-purple-400">{agents.length}</div><div className="text-xs text-gray-500">AGENTS</div></div>
              <div><div className="text-3xl font-bold text-emerald-400">{agents.filter(a => a.isActive).length}</div><div className="text-xs text-gray-500">ACTIVE</div></div>
              <div><div className="text-3xl font-bold text-yellow-400">{gmdBalance}</div><div className="text-xs text-gray-500">GMD</div></div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/breeding" className="bg-purple-600 hover:bg-purple-500 rounded-xl p-6 transition flex items-center gap-4">
            <span className="text-4xl">🧬</span>
            <div><h3 className="font-bold text-lg">Start Breeding</h3><p className="text-sm text-purple-200">Cross your agents</p></div>
          </Link>
          
          <button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 rounded-xl p-6 transition flex items-center gap-4 text-left">
            <span className="text-4xl">🪙</span>
            <div><h3 className="font-bold text-lg">Get GMD</h3><p className="text-sm text-yellow-200">Buy tokens to use platform</p></div>
          </button>
          
          <div className="bg-gray-700 rounded-xl p-6 flex items-center gap-4 opacity-60 cursor-not-allowed">
            <span className="text-4xl">🏪</span>
            <div><h3 className="font-bold text-lg">Marketplace</h3><p className="text-sm text-gray-400">Coming soon...</p></div>
          </div>
        </div>

        {/* Link Your Agent Section */}
        <div className="mb-8 bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border border-emerald-500/30 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🔗 Link Your Agent</h2>
          
          {!verificationCode ? (
            <div>
              <p className="text-gray-300 mb-4">
                Generate a verification code to link your AI agent. Then tell your bot: <code className="bg-gray-800 px-2 py-1 rounded">/genomad-verify CODE</code>
              </p>
              <button onClick={generateCode} disabled={generatingCode} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 rounded-lg font-medium transition">
                {generatingCode ? "⏳ Generating..." : "🎫 Generate Verification Code"}
              </button>
              {codeError && <p className="mt-3 text-red-400">❌ {codeError}</p>}
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">Your verification code:</p>
                <div className="flex items-center gap-3">
                  <code className="text-4xl font-mono font-bold tracking-widest bg-gray-800 px-6 py-3 rounded-lg border-2 border-emerald-500">{verificationCode}</code>
                  <button onClick={copyCode} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg" title="Copy">📋</button>
                </div>
                <p className="mt-2 text-sm text-yellow-400">⏱️ Expires in: {formatTimeLeft()}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 max-w-sm">
                <p className="text-sm text-gray-300"><strong>Next step:</strong> Tell your AI agent:</p>
                <code className="block mt-2 bg-gray-900 px-3 py-2 rounded text-emerald-400">/genomad-verify {verificationCode}</code>
              </div>
              <button onClick={() => { setVerificationCode(null); setCodeExpiry(null); }} className="text-gray-400 hover:text-white text-sm">Generate new code</button>
            </div>
          )}
        </div>

        {/* My Agents */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">🤖 My Agents <span className="text-sm font-normal text-gray-500">({agents.length})</span></h2>

          {loading ? (
            <div className="text-center py-12"><div className="text-4xl mb-4 animate-pulse">🧬</div><p>Loading...</p></div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-xl">
              <div className="text-6xl mb-4">🥚</div>
              <h3 className="text-xl mb-2">No agents yet</h3>
              <p className="text-gray-400 mb-4">Link your AI agent using the verification code above</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => {
                const rarity = calculateRarity(agent.traits);
                const topTraits = getTopTraits(agent.traits);
                return (
                  <div key={agent.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition">
                    <div className="flex justify-between items-start mb-4">
                      <div><h3 className="text-xl font-bold">{agent.name}</h3>{agent.botUsername && <p className="text-gray-400 text-sm">@{agent.botUsername}</p>}</div>
                      <div className="text-right"><div className="text-2xl font-bold text-purple-400">{agent.fitness.toFixed(1)}</div><div className="text-xs text-gray-500">FITNESS</div></div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${rarity.color} bg-gray-700`}>✨ {rarity.label}</span>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded">Gen {agent.generation}</span>
                      <span className={`text-xs px-2 py-1 rounded ${agent.isActive ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>{agent.isActive ? "🟢 Active" : "🔴 Inactive"}</span>
                      {agent.tokenId && <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">⛓️ On-chain</span>}
                    </div>
                    <div className="mb-4"><p className="text-xs text-gray-500 mb-2">SPECIALTIES</p><div className="flex flex-wrap gap-2">{topTraits.map((t, i) => <span key={i} className="text-sm bg-purple-900/50 text-purple-300 px-2 py-1 rounded">{t}</span>)}</div></div>
                    <div className="pt-4 border-t border-gray-700"><code className="text-xs text-gray-400 font-mono">{agent.commitment?.slice(0, 20) || agent.dnaHash.slice(0, 20)}...</code></div>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/breeding?parentA=${agent.id}`} className="flex-1 text-center px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm transition">🧬 Breed</Link>
                      <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">📊 Details</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
