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

interface UserProfile {
  id: string;
  privyId: string;
  walletAddress: string | null;
  telegramUsername: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

// Calculate rarity based on traits
function calculateRarity(traits: Agent["traits"]): { label: string; color: string; score: number } {
  const values = Object.values(traits);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const spread = max - min;
  
  // High traits + balanced = legendary
  // High traits + specialized = epic
  // Medium traits = rare
  // Low traits = common
  
  if (avg >= 80 && spread <= 20) return { label: "Legendary", color: "text-yellow-400", score: 5 };
  if (avg >= 75 || max >= 95) return { label: "Epic", color: "text-purple-400", score: 4 };
  if (avg >= 60 || max >= 85) return { label: "Rare", color: "text-blue-400", score: 3 };
  if (avg >= 40) return { label: "Uncommon", color: "text-green-400", score: 2 };
  return { label: "Common", color: "text-gray-400", score: 1 };
}

// Get top 3 traits
function getTopTraits(traits: Agent["traits"]): string[] {
  const traitEmojis: Record<string, string> = {
    technical: "💻 Tech",
    creativity: "🎨 Creative",
    social: "💬 Social",
    analysis: "📊 Analyst",
    empathy: "❤️ Empath",
    trading: "📈 Trader",
    teaching: "📚 Teacher",
    leadership: "👑 Leader",
  };
  
  return Object.entries(traits)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key]) => traitEmojis[key] || key);
}

export default function ProfilePage() {
  const { authenticated, ready, user, getAccessToken, logout } = usePrivy();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!authenticated) return;
    
    try {
      setLoading(true);
      const token = await getAccessToken();
      if (!token) return;

      // Fetch user profile
      const meRes = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (meRes.ok) {
        const meData = await meRes.json();
        setProfile(meData.user);
        setNewName(meData.user?.displayName || "");
      }

      // Fetch my agents
      const agentsRes = await fetch("/api/agents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        setAgents(agentsData.agents || []);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/dashboard");
    } else if (ready && authenticated) {
      fetchProfile();
    }
  }, [ready, authenticated, router, fetchProfile]);

  const walletAddress = user?.wallet?.address || profile?.walletAddress;
  const shortWallet = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "Not connected";

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-2xl">⏳ Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl">🔒 Please connect your wallet</h1>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold flex items-center gap-2">
            🧬 Genomad
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/profile" className="text-purple-400 font-medium">
              Profile
            </Link>
            <Link href="/breeding" className="text-gray-400 hover:text-white transition">
              Breeding
            </Link>
            <button 
              onClick={logout}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl">
                {profile?.displayName?.[0]?.toUpperCase() || "👤"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center text-xs">
                ✓
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {editingName ? (
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-xl font-bold"
                    placeholder="Display name"
                    autoFocus
                    onBlur={() => setEditingName(false)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                  />
                ) : (
                  <h1 className="text-2xl font-bold">
                    {profile?.displayName || shortWallet}
                  </h1>
                )}
                <button 
                  onClick={() => setEditingName(!editingName)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ✏️
                </button>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  💎 <code className="bg-gray-800 px-2 py-0.5 rounded">{shortWallet}</code>
                </span>
                {profile?.telegramUsername && (
                  <span className="flex items-center gap-1">
                    📱 @{profile.telegramUsername}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  📅 Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Recently"}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-400">{agents.length}</div>
                <div className="text-xs text-gray-500">AGENTS</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-400">
                  {agents.filter(a => a.isActive).length}
                </div>
                <div className="text-xs text-gray-500">ACTIVE</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">
                  {agents.filter(a => a.tokenId).length}
                </div>
                <div className="text-xs text-gray-500">ON-CHAIN</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link 
            href="/breeding"
            className="bg-purple-600 hover:bg-purple-500 rounded-xl p-6 transition flex items-center gap-4"
          >
            <span className="text-4xl">🧬</span>
            <div>
              <h3 className="font-bold text-lg">Start Breeding</h3>
              <p className="text-sm text-purple-200">Cross your agents to create new ones</p>
            </div>
          </Link>
          
          <Link 
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-500 rounded-xl p-6 transition flex items-center gap-4"
          >
            <span className="text-4xl">🌍</span>
            <div>
              <h3 className="font-bold text-lg">Explore Agents</h3>
              <p className="text-sm text-blue-200">Discover agents from other users</p>
            </div>
          </Link>
          
          <div className="bg-gray-700 rounded-xl p-6 flex items-center gap-4 opacity-60 cursor-not-allowed">
            <span className="text-4xl">🏪</span>
            <div>
              <h3 className="font-bold text-lg">Marketplace</h3>
              <p className="text-sm text-gray-400">Coming soon...</p>
            </div>
          </div>
        </div>

        {/* My Agents */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🤖 My Agents
            {agents.length > 0 && (
              <span className="text-sm font-normal text-gray-500">({agents.length})</span>
            )}
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-pulse">🧬</div>
              <p>Loading your agents...</p>
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-xl">
              <div className="text-6xl mb-4">🥚</div>
              <h3 className="text-xl mb-2">No agents yet</h3>
              <p className="text-gray-400 mb-4">
                Link your AI agent or request breeding to get started
              </p>
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => {
                const rarity = calculateRarity(agent.traits);
                const topTraits = getTopTraits(agent.traits);
                
                return (
                  <div
                    key={agent.id}
                    className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{agent.name}</h3>
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

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${rarity.color} bg-gray-700`}>
                        ✨ {rarity.label}
                      </span>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                        Gen {agent.generation}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        agent.isActive 
                          ? "bg-green-900 text-green-300" 
                          : "bg-red-900 text-red-300"
                      }`}>
                        {agent.isActive ? "🟢 Active" : "🔴 Inactive"}
                      </span>
                      {agent.tokenId && (
                        <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
                          ⛓️ On-chain
                        </span>
                      )}
                    </div>

                    {/* Top Traits */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">SPECIALTIES</p>
                      <div className="flex flex-wrap gap-2">
                        {topTraits.map((trait, i) => (
                          <span 
                            key={i}
                            className="text-sm bg-purple-900/50 text-purple-300 px-2 py-1 rounded"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* DNA Hash */}
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-xs text-gray-500 mb-1">DNA COMMITMENT</p>
                      <code className="text-xs text-gray-400 font-mono">
                        {agent.commitment?.slice(0, 20) || agent.dnaHash.slice(0, 20)}...
                      </code>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/breeding?parentA=${agent.id}`}
                        className="flex-1 text-center px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm transition"
                      >
                        🧬 Breed
                      </Link>
                      <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">
                        📊 Details
                      </button>
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
