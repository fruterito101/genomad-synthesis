// src/app/breeding/page.tsx
"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LoginButton } from "@/components/LoginButton";

interface Agent {
  id: string;
  name: string;
  botUsername: string | null;
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
  ownerId: string;
  isMine?: boolean;
  owner?: {
    wallet: string | null;
    name: string | null;
  } | null;
}

interface BreedingRequest {
  id: string;
  status: string;
  parentA?: { id: string; name: string } | null;
  parentB?: { id: string; name: string } | null;
  createdAt: string;
  childName?: string;
}

const CROSSOVER_TYPES = [
  { id: "weighted", name: "Weighted", desc: "Dominant traits more likely" },
  { id: "uniform", name: "Uniform", desc: "50/50 from each parent" },
  { id: "single", name: "Single-Point", desc: "Cut at random point" },
];

function BreedingContent() {
  const { authenticated, ready, getAccessToken, logout } = usePrivy();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [requests, setRequests] = useState<BreedingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [parentA, setParentA] = useState<string | null>(searchParams.get("parentA"));
  const [parentB, setParentB] = useState<string | null>(null);
  const [crossoverType, setCrossoverType] = useState("weighted");
  const [childName, setChildName] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"new" | "pending">("new");

  const fetchData = useCallback(async () => {
    if (!authenticated) return;
    
    try {
      setLoading(true);
      const token = await getAccessToken();
      if (!token) return;
      
      const headers = { Authorization: `Bearer ${token}` };

      const myRes = await fetch("/api/agents", { headers });
      if (myRes.ok) {
        const data = await myRes.json();
        setMyAgents(data.agents || []);
      }

      const allRes = await fetch("/api/agents/register-skill", { headers });
      if (allRes.ok) {
        const data = await allRes.json();
        setAllAgents(data.agents || []);
      }

      const reqRes = await fetch("/api/breeding/requests", { headers });
      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests([...(data.pending || []), ...(data.approved || []), ...(data.executed || [])]);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/dashboard");
    } else if (ready && authenticated) {
      fetchData();
    }
  }, [ready, authenticated, router, fetchData]);

  const handleSubmit = async () => {
    if (!parentA || !parentB) {
      setError("Please select both parents");
      return;
    }
    if (parentA === parentB) {
      setError("Cannot breed an agent with itself");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/breeding/request", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ parentAId: parentA, parentBId: parentB, crossoverType, childName: childName || undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setSuccess(`Request created! ID: ${data.request.id.slice(0, 8)}...`);
      setParentA(null);
      setParentB(null);
      setChildName("");
      fetchData();
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const getAgentById = (id: string): Agent | undefined => [...myAgents, ...allAgents].find(a => a.id === id);
  const parentAAgent = parentA ? getAgentById(parentA) : null;
  const parentBAgent = parentB ? getAgentById(parentB) : null;

  const predictChild = () => {
    if (!parentAAgent || !parentBAgent) return null;
    const avgFitness = (parentAAgent.fitness + parentBAgent.fitness) / 2;
    const generation = Math.max(parentAAgent.generation, parentBAgent.generation) + 1;
    return { avgFitness, generation };
  };

  const prediction = predictChild();

  if (!ready) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center"><div className="text-2xl">⏳ Loading...</div></div>;
  }

  if (!authenticated) {
    return <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-4"><h1 className="text-2xl">🔒 Connect wallet to breed</h1><LoginButton /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold">🧬 Genomad</Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link>
            <Link href="/profile" className="text-gray-400 hover:text-white">Profile</Link>
            <Link href="/breeding" className="text-purple-400 font-medium">Breeding</Link>
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 border border-yellow-600/50 px-3 py-1.5 rounded-lg"><span className="text-yellow-400 font-bold">🪙</span><span className="font-mono font-bold text-yellow-300">0</span><span className="text-yellow-400/70 text-sm">GMD</span></div><button onClick={logout} className="text-red-400 hover:text-red-300 text-sm">Logout</button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">🧬 Breeding Lab</h1>

        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button onClick={() => setActiveTab("new")} className={`pb-4 px-2 font-medium ${activeTab === "new" ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-400"}`}>🆕 New</button>
          <button onClick={() => setActiveTab("pending")} className={`pb-4 px-2 font-medium ${activeTab === "pending" ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-400"}`}>⏳ Requests ({requests.length})</button>
        </div>

        {activeTab === "new" ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Parent A */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">👤 Parent A <span className="text-sm font-normal text-gray-400">(Your Agent)</span></h2>
                {myAgents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No agents yet.</p>
                    <Link href="/dashboard" className="text-purple-400 hover:underline">Link one first →</Link>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {myAgents.map((agent) => (
                      <button key={agent.id} onClick={() => setParentA(agent.id)} className={`p-4 rounded-lg border text-left ${parentA === agent.id ? "border-purple-500 bg-purple-900/30" : "border-gray-700 hover:border-gray-600"}`}>
                        <div className="flex justify-between"><div><span className="font-bold">{agent.name}</span><span className="ml-2 text-sm text-gray-400">Gen {agent.generation}</span></div><span className="text-purple-400 font-bold">{agent.fitness.toFixed(1)}</span></div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Parent B */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">🤝 Parent B <span className="text-sm font-normal text-gray-400">(Any Agent)</span></h2>
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {allAgents.filter(a => a.id !== parentA).map((agent) => (
                    <button key={agent.id} onClick={() => setParentB(agent.id)} className={`p-4 rounded-lg border text-left ${parentB === agent.id ? "border-emerald-500 bg-emerald-900/30" : "border-gray-700 hover:border-gray-600"}`}>
                      <div className="flex justify-between"><div><span className="font-bold">{agent.name}</span><span className="ml-2 text-sm text-gray-400">Gen {agent.generation}</span>{agent.isMine && <span className="ml-2 text-xs text-emerald-400">Yours</span>}</div><span className="text-purple-400 font-bold">{agent.fitness.toFixed(1)}</span></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">⚙️ Options</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Crossover Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {CROSSOVER_TYPES.map((type) => (
                        <button key={type.id} onClick={() => setCrossoverType(type.id)} className={`p-3 rounded-lg border ${crossoverType === type.id ? "border-purple-500 bg-purple-900/30" : "border-gray-700"}`}>
                          <div className="font-medium text-sm">{type.name}</div>
                          <div className="text-xs text-gray-500">{type.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Child Name</label>
                    <input type="text" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Auto-generated" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-xl p-6 sticky top-4 h-fit">
              <h2 className="text-xl font-bold mb-4">🔮 Preview</h2>
              {parentAAgent && parentBAgent ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center"><div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-2xl mx-auto mb-2">{parentAAgent.name[0]}</div><p className="text-sm font-medium">{parentAAgent.name}</p></div>
                    <div className="text-3xl">×</div>
                    <div className="text-center"><div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-2xl mx-auto mb-2">{parentBAgent.name[0]}</div><p className="text-sm font-medium">{parentBAgent.name}</p></div>
                  </div>
                  {prediction && (
                    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-400 mb-2">Predicted</p>
                      <div className="flex justify-between mb-2"><span>Generation</span><span className="font-bold">{prediction.generation}</span></div>
                      <div className="flex justify-between"><span>Est. Fitness</span><span className="font-bold text-purple-400">{prediction.avgFitness.toFixed(1)} ±5</span></div>
                    </div>
                  )}
                  {error && <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4 text-sm">❌ {error}</div>}
                  {success && <div className="bg-green-900/50 border border-green-500 rounded-lg p-3 mb-4 text-sm">✅ {success}</div>}
                  <button onClick={handleSubmit} disabled={submitting} className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 rounded-xl font-bold text-lg">{submitting ? "⏳ Creating..." : "🧬 Request Breeding"}</button>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400"><div className="text-4xl mb-4">👆</div><p>Select two parents</p></div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 rounded-xl"><div className="text-4xl mb-4">📭</div><p className="text-gray-400">No requests yet</p></div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex justify-between">
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${req.status === "executed" ? "bg-green-900 text-green-300" : req.status === "approved" ? "bg-blue-900 text-blue-300" : "bg-yellow-900 text-yellow-300"}`}>{req.status.toUpperCase()}</span>
                      <p className="text-lg mt-2">{req.parentA?.name || "Agent"} × {req.parentB?.name || "Agent"}</p>
                    </div>
                    <code className="text-xs text-gray-500">{req.id.slice(0, 8)}...</code>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function BreedingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center"><div className="text-2xl">⏳ Loading...</div></div>}>
      <BreedingContent />
    </Suspense>
  );
}
