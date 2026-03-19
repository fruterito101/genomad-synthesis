// src/app/breeding/page.tsx
"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LoginButton } from "@/components/LoginButton";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui";
import { Dna, Plus, ArrowRight, Sparkles, Check, Clock, Shield, Zap, Crown, Activity, RefreshCw, AlertCircle, ChevronDown, Cpu, Palette, MessageSquare, Brain, Heart, TrendingUp, GraduationCap } from "lucide-react";

interface Agent { id: string; name: string; botUsername: string | null; traits: { technical: number; creativity: number; social: number; analysis: number; empathy: number; trading: number; teaching: number; leadership: number; }; fitness: number; generation: number; isActive: boolean; ownerId: string; isMine?: boolean; }
interface BreedingRequest { id: string; status: string; parentA?: { id: string; name: string } | null; parentB?: { id: string; name: string } | null; createdAt: string; childName?: string; }

const CROSSOVER_TYPES = [
  { id: "weighted", name: "Weighted", desc: "Dominant traits", icon: Crown },
  { id: "uniform", name: "Uniform", desc: "50/50 split", icon: Activity },
  { id: "single", name: "Single-Point", desc: "Random cut", icon: Zap },
];

const traitIcons: Record<string, React.ElementType> = { technical: Cpu, creativity: Palette, social: MessageSquare, analysis: Brain, empathy: Heart, trading: TrendingUp, teaching: GraduationCap, leadership: Crown };
const traitColors: Record<string, string> = { technical: "#3B82F6", creativity: "#EC4899", social: "#8B5CF6", analysis: "#06B6D4", empathy: "#EF4444", trading: "#10B981", teaching: "#F59E0B", leadership: "#F97316" };

function BreedingContent() {
  const { authenticated, ready, getAccessToken } = usePrivy();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [parentA, setParentA] = useState<Agent | null>(null);
  const [parentB, setParentB] = useState<Agent | null>(null);
  const [crossoverType, setCrossoverType] = useState("weighted");
  const [childName, setChildName] = useState("");
  const [loading, setLoading] = useState(true);
  const [breeding, setBreeding] = useState(false);
  const [result, setResult] = useState<BreedingRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<BreedingRequest[]>([]);
  const [showParentASelector, setShowParentASelector] = useState(false);
  const [showParentBSelector, setShowParentBSelector] = useState(false);

  const fetchAgents = useCallback(async () => {
    if (!authenticated) return;
    try {
      setLoading(true);
      const token = await getAccessToken();
      if (!token) return;
      const [agentsRes, requestsRes] = await Promise.all([
        fetch("/api/agents", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/breeding/requests", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (agentsRes.ok) { const data = await agentsRes.json(); setAllAgents(data.agents || []); setMyAgents((data.agents || []).filter((a: Agent) => a.isMine)); }
      if (requestsRes.ok) { const reqData = await requestsRes.json(); setPendingRequests(reqData.requests || []); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [authenticated, getAccessToken]);

  useEffect(() => { if (ready && !authenticated) router.push("/dashboard"); else if (ready && authenticated) fetchAgents(); }, [ready, authenticated, router, fetchAgents]);
  useEffect(() => { const parentAId = searchParams.get("parentA"); if (parentAId && myAgents.length > 0) { const agent = myAgents.find(a => a.id === parentAId); if (agent) setParentA(agent); } }, [searchParams, myAgents]);

  const startBreeding = async () => {
    if (!parentA || !parentB) return;
    setBreeding(true); setError(null); setResult(null);
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch("/api/breeding/request", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ parentAId: parentA.id, parentBId: parentB.id, crossoverType, childName: childName || undefined }) });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Breeding failed");
      else { setResult(data.request); fetchAgents(); }
    } catch (err) { setError(String(err)); } finally { setBreeding(false); }
  };

  const predictedTraits = parentA && parentB ? Object.keys(parentA.traits).map(trait => { const key = trait as keyof typeof parentA.traits; const avg = Math.round((parentA.traits[key] + parentB.traits[key]) / 2); return { trait: key, avg }; }) : [];
  const predictedFitness = parentA && parentB ? ((parentA.fitness + parentB.fitness) / 2).toFixed(1) : "?";

  if (!ready) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg-primary)" }}><Dna className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse" style={{ color: "var(--color-primary)" }} /></div>;
  if (!authenticated) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ backgroundColor: "var(--color-bg-primary)" }}><Shield className="w-12 h-12 sm:w-16 sm:h-16" style={{ color: "var(--color-primary)" }} /><h1 className="text-xl sm:text-2xl font-bold text-center" style={{ color: "var(--color-text-primary)" }}>Connect to Breed</h1><LoginButton /></div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-8 sm:pb-12">
        {/* Header */}
        <motion.div className="mb-6 sm:mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3" style={{ color: "var(--color-text-primary)" }}><Dna className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: "var(--color-primary)" }} />Breeding Lab</h1>
          <p className="text-sm sm:text-base" style={{ color: "var(--color-text-secondary)" }}>Combina dos agentes para crear una nueva generación</p>
        </motion.div>

        {/* Breeding Interface */}
        <motion.div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          {/* Parents Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-4 sm:gap-6 items-center">
            {/* Parent A */}
            <div className="relative">
              <p className="text-xs sm:text-sm font-medium mb-2" style={{ color: "var(--color-text-muted)" }}>PARENT A</p>
              <motion.button onClick={() => setShowParentASelector(!showParentASelector)} className="w-full p-4 sm:p-6 rounded-xl text-left" style={{ backgroundColor: parentA ? "var(--color-bg-tertiary)" : "var(--color-bg-primary)", border: `2px solid ${parentA ? "var(--color-primary)" : "var(--color-border)"}` }}>
                {parentA ? (
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-accent-1))" }}><Crown className="w-5 h-5 sm:w-7 sm:h-7 text-white" /></div>
                    <div className="flex-1 min-w-0"><h3 className="font-bold text-sm sm:text-lg truncate" style={{ color: "var(--color-text-primary)" }}>{parentA.name}</h3><p className="text-xs sm:text-sm" style={{ color: "var(--color-text-muted)" }}>Fitness: {parentA.fitness.toFixed(1)}</p></div>
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: "var(--color-text-muted)" }} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-4"><Plus className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: "var(--color-text-muted)" }} /><span className="text-sm sm:text-base" style={{ color: "var(--color-text-muted)" }}>Select Agent</span></div>
                )}
              </motion.button>
              <AnimatePresence>
                {showParentASelector && (
                  <motion.div className="absolute top-full left-0 right-0 z-20 mt-2 rounded-xl overflow-hidden max-h-60 overflow-y-auto" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    {myAgents.filter(a => a.id !== parentB?.id).map(agent => (
                      <button key={agent.id} className="w-full p-3 sm:p-4 flex items-center gap-2 sm:gap-3 text-left transition-colors hover:bg-[var(--color-bg-tertiary)]" style={{ borderBottom: "1px solid var(--color-border)" }} onClick={() => { setParentA(agent); setShowParentASelector(false); }}>
                        <Dna className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "var(--color-primary)" }} />
                        <span className="text-sm sm:text-base truncate" style={{ color: "var(--color-text-primary)" }}>{agent.name}</span>
                        <span className="ml-auto text-xs sm:text-sm flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>{agent.fitness.toFixed(1)}</span>
                      </button>
                    ))}
                    {myAgents.length === 0 && <p className="p-4 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>No agents</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Plus Icon */}
            <div className="flex items-center justify-center py-2 lg:py-0">
              <motion.div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-accent-1))" }} animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}><Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white" /></motion.div>
            </div>

            {/* Parent B */}
            <div className="relative">
              <p className="text-xs sm:text-sm font-medium mb-2" style={{ color: "var(--color-text-muted)" }}>PARENT B</p>
              <motion.button onClick={() => setShowParentBSelector(!showParentBSelector)} className="w-full p-4 sm:p-6 rounded-xl text-left" style={{ backgroundColor: parentB ? "var(--color-bg-tertiary)" : "var(--color-bg-primary)", border: `2px solid ${parentB ? "var(--color-secondary)" : "var(--color-border)"}` }}>
                {parentB ? (
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--color-secondary), #06B6D4)" }}><Zap className="w-5 h-5 sm:w-7 sm:h-7 text-white" /></div>
                    <div className="flex-1 min-w-0"><h3 className="font-bold text-sm sm:text-lg truncate" style={{ color: "var(--color-text-primary)" }}>{parentB.name}</h3><p className="text-xs sm:text-sm" style={{ color: "var(--color-text-muted)" }}>Fitness: {parentB.fitness.toFixed(1)}</p></div>
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: "var(--color-text-muted)" }} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-4"><Plus className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: "var(--color-text-muted)" }} /><span className="text-sm sm:text-base" style={{ color: "var(--color-text-muted)" }}>Select Agent</span></div>
                )}
              </motion.button>
              <AnimatePresence>
                {showParentBSelector && (
                  <motion.div className="absolute top-full left-0 right-0 z-20 mt-2 rounded-xl overflow-hidden max-h-60 overflow-y-auto" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    {allAgents.filter(a => a.id !== parentA?.id).map(agent => (
                      <button key={agent.id} className="w-full p-3 sm:p-4 flex items-center gap-2 sm:gap-3 text-left transition-colors hover:bg-[var(--color-bg-tertiary)]" style={{ borderBottom: "1px solid var(--color-border)" }} onClick={() => { setParentB(agent); setShowParentBSelector(false); }}>
                        <Dna className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "var(--color-secondary)" }} />
                        <span className="text-sm sm:text-base truncate" style={{ color: "var(--color-text-primary)" }}>{agent.name}</span>
                        {!agent.isMine && <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-muted)" }}>Ext</span>}
                        <span className="ml-auto text-xs sm:text-sm flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>{agent.fitness.toFixed(1)}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Predicted Traits */}
          {parentA && parentB && (
            <motion.div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl" style={{ backgroundColor: "var(--color-bg-primary)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4">
                <h3 className="font-bold text-sm sm:text-base flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}><Sparkles className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "var(--color-accent-1)" }} />Predicted Traits</h3>
                <div className="text-left sm:text-right"><span className="text-xs sm:text-sm" style={{ color: "var(--color-text-muted)" }}>Est. Fitness:</span><span className="ml-2 text-xl sm:text-2xl font-bold gradient-text">{predictedFitness}</span></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {predictedTraits.map(({ trait, avg }) => { const Icon = traitIcons[trait]; const color = traitColors[trait]; return (
                  <div key={trait} className="p-2 sm:p-3 rounded-lg" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2"><Icon className="w-3 h-3 sm:w-4 sm:h-4" style={{ color }} /><span className="text-[10px] sm:text-xs capitalize truncate" style={{ color: "var(--color-text-muted)" }}>{trait}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm sm:text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>{avg}</span><span className="text-[10px] sm:text-xs" style={{ color: "var(--color-text-muted)" }}>±15</span></div>
                    <div className="h-1 rounded-full mt-1 sm:mt-2" style={{ backgroundColor: "var(--color-bg-tertiary)" }}><div className="h-full rounded-full" style={{ width: `${avg}%`, backgroundColor: color }} /></div>
                  </div>
                );})}
              </div>
            </motion.div>
          )}

          {/* Crossover Type */}
          {parentA && parentB && (
            <motion.div className="mt-4 sm:mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3" style={{ color: "var(--color-text-muted)" }}>CROSSOVER TYPE</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {CROSSOVER_TYPES.map(type => { const Icon = type.icon; return (
                  <motion.button key={type.id} onClick={() => setCrossoverType(type.id)} className="p-3 sm:p-4 rounded-xl text-left" style={{ backgroundColor: crossoverType === type.id ? "rgba(123, 63, 228, 0.1)" : "var(--color-bg-primary)", border: `2px solid ${crossoverType === type.id ? "var(--color-primary)" : "var(--color-border)"}` }}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: crossoverType === type.id ? "var(--color-primary)" : "var(--color-text-muted)" }} />
                      <div className="min-w-0"><p className="font-medium text-sm sm:text-base truncate" style={{ color: "var(--color-text-primary)" }}>{type.name}</p><p className="text-[10px] sm:text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{type.desc}</p></div>
                      {crossoverType === type.id && <Check className="w-4 h-4 sm:w-5 sm:h-5 ml-auto flex-shrink-0" style={{ color: "var(--color-primary)" }} />}
                    </div>
                  </motion.button>
                );})}
              </div>
            </motion.div>
          )}

          {/* Child Name */}
          {parentA && parentB && (
            <motion.div className="mt-4 sm:mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-xs sm:text-sm font-medium mb-2" style={{ color: "var(--color-text-muted)" }}>CHILD NAME (optional)</p>
              <input type="text" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Enter name" className="w-full p-3 sm:p-4 rounded-xl text-sm sm:text-base outline-none" style={{ backgroundColor: "var(--color-bg-primary)", border: "2px solid var(--color-border)", color: "var(--color-text-primary)" }} />
            </motion.div>
          )}

          {/* Breed Button */}
          {parentA && parentB && (
            <motion.div className="mt-6 sm:mt-8 flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button onClick={startBreeding} disabled={breeding} variant="primary" size="lg" className="w-full sm:w-auto px-8 sm:px-12">
                {breeding ? <><RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />Breeding...</> : <><Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />Start Breeding<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /></>}
              </Button>
            </motion.div>
          )}

          {/* Error/Result */}
          {error && (<motion.div className="mt-4 p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--color-error)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: "var(--color-error)" }} /><span className="text-sm" style={{ color: "var(--color-error)" }}>{error}</span></motion.div>)}
          {result && (<motion.div className="mt-4 p-4 sm:p-6 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(123, 63, 228, 0.1))", border: "1px solid var(--color-success)" }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}><div className="flex items-center gap-3"><div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--color-success)" }}><Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" /></div><div><h3 className="font-bold text-sm sm:text-lg" style={{ color: "var(--color-text-primary)" }}>Breeding Request Created!</h3><p className="text-xs sm:text-sm" style={{ color: "var(--color-text-secondary)" }}>{result.status === "approved" ? "Creating child..." : "Waiting approval..."}</p></div></div></motion.div>)}
        </motion.div>

        {/* Pending */}
        {pendingRequests.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}><Clock className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "var(--color-warning)" }} />Pending</h2>
            <div className="space-y-2 sm:space-y-3">
              {pendingRequests.map(req => (
                <div key={req.id} className="p-3 sm:p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0"><Dna className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: "var(--color-primary)" }} /><div className="min-w-0"><p className="text-sm sm:text-base truncate" style={{ color: "var(--color-text-primary)" }}>{req.parentA?.name || "?"} × {req.parentB?.name || "?"}</p><p className="text-[10px] sm:text-sm" style={{ color: "var(--color-text-muted)" }}>{new Date(req.createdAt).toLocaleDateString()}</p></div></div>
                  <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0" style={{ backgroundColor: req.status === "pending" ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)", color: req.status === "pending" ? "var(--color-warning)" : "var(--color-success)" }}>{req.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default function BreedingPage() {
  return (<Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg-primary)" }}><Dna className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse" style={{ color: "var(--color-primary)" }} /></div>}><BreedingContent /></Suspense>);
}
