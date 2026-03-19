"use client"
import dynamicImport from "next/dynamic";
export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LoginButton } from "@/components/LoginButton";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui";
import { Dna, Plus, Loader2, ArrowRight, Sparkles, Check, Clock, Shield, Zap, Crown, Activity, RefreshCw, AlertCircle, ChevronDown, Cpu, Palette, MessageSquare, Brain, Heart, TrendingUp, GraduationCap } from "lucide-react";
import { SuccessModal } from "@/components/SuccessModal";

interface Agent { id: string; name: string; botUsername: string | null; traits: { technical: number; creativity: number; social: number; analysis: number; empathy: number; trading: number; teaching: number; leadership: number; }; fitness: number; generation: number; isActive: boolean; ownerId: string; isMine?: boolean; ownerDisplay?: string; }
interface BreedingRequest { 
  id: string; 
  status: string; 
  parentA?: { id: string; name: string } | null; 
  parentB?: { id: string; name: string } | null; 
  createdAt: string; 
  childName?: string;
  executed?: boolean;
  child?: { id: string; name: string; fitness?: number; traits?: Record<string, number>; generation?: number } | null;
  breeding?: { parentAFitness?: number; parentBFitness?: number; childFitness?: number; improved?: boolean; mutationsApplied?: number } | null;
}

const CROSSOVER_TYPES = [
  { id: "weighted", name: "Weighted", desc: "Dominant traits", icon: Crown },
  { id: "uniform", name: "Uniform", desc: "50/50 split", icon: Activity },
  { id: "single", name: "Single-Point", desc: "Random cut", icon: Zap },
];

const traitIcons = { technical: Cpu, creativity: Palette, social: MessageSquare, analysis: Brain, empathy: Heart, trading: TrendingUp, teaching: GraduationCap, leadership: Crown };
const traitColors: Record<string, string> = { technical: "#3B82F6", creativity: "#EC4899", social: "#8B5CF6", analysis: "#06B6D4", empathy: "#EF4444", trading: "#10B981", teaching: "#F59E0B", leadership: "#F97316" };

const defaultTraits = { technical: 50, creativity: 50, social: 50, analysis: 50, empathy: 50, trading: 50, teaching: 50, leadership: 50 };
function safeTraits(traits: any): typeof defaultTraits {
  if (!traits) return defaultTraits;
  if (typeof traits === "string") { try { return { ...defaultTraits, ...JSON.parse(traits) }; } catch { return defaultTraits; } }
  return { ...defaultTraits, ...traits };
}

function BreedingContent() {
  const { authenticated, ready, getAccessToken } = usePrivy();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [parentA, setParentA] = useState<Agent | null>(null);
  const [parentB, setParentB] = useState<Agent | null>(null);
  const [breedingCheck, setBreedingCheck] = useState<{
    exists: boolean;
    canBreed: boolean;
    needsRequest: boolean;
    requestId?: string;
  } | null>(null);
  const [checkingBreeding, setCheckingBreeding] = useState(false);
  const [crossoverType, setCrossoverType] = useState("weighted");
  const [childName, setChildName] = useState("");
  const [loading, setLoading] = useState(true);
  const [breeding, setBreeding] = useState(false);
  const [result, setResult] = useState<BreedingRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<BreedingRequest[]>([]);
  const [showParentASelector, setShowParentASelector] = useState(false);
  const [showParentBSelector, setShowParentBSelector] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fetchAgents = useCallback(async () => {
    if (!authenticated) return;
    try {
      setLoading(true);
      const token = await getAccessToken();
      if (!token) return;
      const [agentsRes, requestsRes] = await Promise.all([
        fetch("/api/agents/available", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/breeding/requests", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (agentsRes.ok) { const data = await agentsRes.json(); setAllAgents(data.allAgents || []); setMyAgents(data.myAgents || []); }
      if (requestsRes.ok) { const reqData = await requestsRes.json(); setPendingRequests(reqData.requests || []); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [authenticated, getAccessToken]);

  useEffect(() => { if (ready && !authenticated) router.push("/dashboard"); else if (ready && authenticated) fetchAgents(); }, [ready, authenticated, router, fetchAgents]);

  // Verificar si ya existe una solicitud aprobada entre los padres seleccionados
  useEffect(() => {
    const checkBreedingStatus = async () => {
      if (!parentA || !parentB || !authenticated) {
        setBreedingCheck(null);
        return;
      }
      if (parentA.isMine && parentB.isMine) {
        setBreedingCheck({ exists: false, canBreed: true, needsRequest: false });
        return;
      }
      try {
        setCheckingBreeding(true);
        const token = await getAccessToken();
        const res = await fetch(
          `/api/breeding/check?parentAId=${parentA.id}&parentBId=${parentB.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setBreedingCheck(data);
        }
      } catch (e) {
        console.error("Failed to check breeding status", e);
      } finally {
        setCheckingBreeding(false);
      }
    };
    checkBreedingStatus();
  }, [parentA, parentB, authenticated, getAccessToken]);
  useEffect(() => { const parentAId = searchParams.get("parentA"); if (parentAId && myAgents.length > 0) { const agent = myAgents.find(a => a.id === parentAId); if (agent) setParentA(agent); } }, [searchParams, myAgents]);

  const startBreeding = async () => {
    if (!parentA || !parentB) return;
    setBreeding(true); setError(null); setResult(null);
    try {
      const token = await getAccessToken();
      if (!token) return;
      
      // Si ya existe una solicitud aprobada, ejecutar directamente
      if (breedingCheck?.canBreed && breedingCheck?.requestId) {
        const execRes = await fetch(`/api/breeding/${breedingCheck.requestId}/execute`, { 
          method: "POST", 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const execData = await execRes.json();
        if (!execRes.ok) { setError(execData.error || "Breeding execution failed"); return; }
        setResult({ id: breedingCheck.requestId, status: "COMPLETED", createdAt: new Date().toISOString(), child: execData.child, breeding: execData.breeding, executed: true });
        setBreedingCheck(null); // Limpiar para requerir nueva solicitud
        setShowSuccessModal(true);
        fetchAgents();
        return;
      }
      
      // Si no hay solicitud aprobada, crear nueva
      const res = await fetch("/api/breeding/request", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ parentAId: parentA.id, parentBId: parentB.id, crossoverType, childName: childName || undefined }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Breeding failed"); return; }
      if (data.autoApproved && data.request?.id) {
        const execRes = await fetch(`/api/breeding/${data.request.id}/execute`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        const execData = await execRes.json();
        if (!execRes.ok) { setError(execData.error || "Breeding execution failed"); return; }
        setResult({ ...data.request, child: execData.child, breeding: execData.breeding, executed: true });
        setBreedingCheck(null); // Limpiar para requerir nueva solicitud
        setShowSuccessModal(true);
      } else {
        setResult(data.request);
      }
      fetchAgents();
    } catch (err) { setError(String(err)); } finally { setBreeding(false); }
  };

  const predictedTraits = parentA && parentB ? Object.keys(defaultTraits).map(trait => { const key = trait as keyof typeof defaultTraits; const tA = safeTraits(parentA.traits); const tB = safeTraits(parentB.traits); const avg = Math.round((tA[key] + tB[key]) / 2); return { trait: key, avg }; }) : [];
  const predictedFitness = parentA && parentB ? ((parentA.fitness + parentB.fitness) / 2).toFixed(1) : "?";

  if (!ready) return <div className="min-h-screen flex items-center justify-center bg-background"><Dna className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse text-primary" /></div>;
  if (!authenticated) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-background"><Shield className="w-12 h-12 sm:w-16 sm:h-16 text-primary" /><h1 className="text-xl sm:text-2xl font-bold text-center">Connect to Breed</h1><LoginButton /></div>;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-semibold">Breeding Lab</h1>
        </header>
        
        <main className="flex-1 p-4 lg:p-6">
          {/* Header */}
          <motion.div className="mb-6 sm:mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3"><Dna className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />Breeding Lab</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Combina dos agentes para crear una nueva generación</p>
          </motion.div>

          {/* Breeding Interface */}
          <motion.div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 bg-card border border-border" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            {/* Parents Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-4 sm:gap-6 items-center">
              {/* Parent A */}
              <div className="relative">
                <p className="text-xs sm:text-sm font-medium mb-2 text-muted-foreground">PARENT A</p>
                <motion.button onClick={() => setShowParentASelector(!showParentASelector)} className={`w-full p-4 sm:p-6 rounded-xl text-left border-2 ${parentA ? "bg-muted border-primary" : "bg-background border-border"}`}>
                  {parentA ? (
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary to-accent"><Crown className="w-5 h-5 sm:w-7 sm:h-7 text-white" /></div>
                      <div className="flex-1 min-w-0"><h3 className="font-bold text-sm sm:text-lg truncate">{parentA.name}</h3><p className="text-xs sm:text-sm text-muted-foreground">Fitness: {parentA.fitness.toFixed(1)}</p></div>
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-4"><Plus className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" /><span className="text-sm sm:text-base text-muted-foreground">Select Agent</span></div>
                  )}
                </motion.button>
                <AnimatePresence>
                  {showParentASelector && (
                    <motion.div className="absolute top-full left-0 right-0 z-20 mt-2 rounded-xl overflow-hidden max-h-60 overflow-y-auto bg-card border border-border" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      {myAgents.filter(a => a.id !== parentB?.id).map(agent => (
                        <button key={agent.id} className="w-full p-3 sm:p-4 flex items-center gap-2 sm:gap-3 text-left transition-colors hover:bg-muted border-b border-border" onClick={() => { setParentA(agent); setShowParentASelector(false); }}>
                          <Dna className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          <span className="text-sm sm:text-base truncate">{agent.name}</span>
                          <span className="ml-auto text-xs sm:text-sm flex-shrink-0 text-muted-foreground">{agent.fitness.toFixed(1)}</span>
                        </button>
                      ))}
                      {myAgents.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No agents</p>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Plus Icon */}
              <div className="flex items-center justify-center py-2 lg:py-0">
                <motion.div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-accent" animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}><Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white" /></motion.div>
              </div>

              {/* Parent B */}
              <div className="relative">
                <p className="text-xs sm:text-sm font-medium mb-2 text-muted-foreground">PARENT B</p>
                <motion.button onClick={() => setShowParentBSelector(!showParentBSelector)} className={`w-full p-4 sm:p-6 rounded-xl text-left border-2 ${parentB ? "bg-muted border-secondary" : "bg-background border-border"}`}>
                  {parentB ? (
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-secondary to-cyan-500"><Zap className="w-5 h-5 sm:w-7 sm:h-7 text-white" /></div>
                      <div className="flex-1 min-w-0"><h3 className="font-bold text-sm sm:text-lg truncate">{parentB.name}</h3><p className="text-xs sm:text-sm text-muted-foreground">Fitness: {parentB.fitness.toFixed(1)}</p></div>
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-4"><Plus className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" /><span className="text-sm sm:text-base text-muted-foreground">Select Agent</span></div>
                  )}
                </motion.button>
                <AnimatePresence>
                  {showParentBSelector && (
                    <motion.div className="absolute top-full left-0 right-0 z-20 mt-2 rounded-xl overflow-hidden max-h-60 overflow-y-auto bg-card border border-border" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      {allAgents.filter(a => a.id !== parentA?.id).map(agent => (
                        <button key={agent.id} className="w-full p-3 sm:p-4 flex items-center gap-2 sm:gap-3 text-left transition-colors hover:bg-muted border-b border-border" onClick={() => { setParentB(agent); setShowParentBSelector(false); }}>
                          <Dna className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                          <span className="text-sm sm:text-base truncate">{agent.name}</span>
                          {!agent.isMine && <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Ext</span>}
                          <span className="ml-auto text-xs sm:text-sm flex-shrink-0 text-muted-foreground">{agent.fitness.toFixed(1)}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Cross-owner Status */}
            {parentA && parentB && (!parentA.isMine || !parentB.isMine) && (
              <motion.div 
                className={`mt-4 p-3 sm:p-4 rounded-xl flex items-center gap-3 ${
                  breedingCheck?.canBreed 
                    ? "bg-emerald-500/10 border border-emerald-500" 
                    : "bg-amber-500/10 border border-amber-500"
                }`} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
              >
                {breedingCheck?.canBreed ? (
                  <>
                    <Check className="w-5 h-5 flex-shrink-0 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-emerald-500">✅ Breeding Aprobado</p>
                      <p className="text-xs text-muted-foreground">
                        Ambos dueños han aprobado. ¡Puedes ejecutar el breeding!
                      </p>
                    </div>
                  </>
                ) : checkingBreeding ? (
                  <>
                    <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin text-amber-500" />
                    <p className="text-sm text-amber-500">Verificando estado...</p>
                  </>
                ) : breedingCheck?.exists && !breedingCheck?.canBreed ? (
                  <>
                    <Clock className="w-5 h-5 flex-shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-amber-500">⏳ Esperando Aprobación</p>
                      <p className="text-xs text-muted-foreground">
                        Ya existe una solicitud pendiente. Esperando que el otro dueño apruebe.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-amber-500">Requiere Aprobación</p>
                      <p className="text-xs text-muted-foreground">
                        {!parentA.isMine && parentA.ownerDisplay ? `${parentA.name} es de ${parentA.ownerDisplay}` : ""}
                        {!parentA.isMine && !parentB.isMine ? " y " : ""}
                        {!parentB.isMine && parentB.ownerDisplay ? `${parentB.name} es de ${parentB.ownerDisplay}` : ""}
                        . Se enviará una solicitud.
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Predicted Traits */}
            {parentA && parentB && (
              <motion.div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl bg-background" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4">
                  <h3 className="font-bold text-sm sm:text-base flex items-center gap-2"><Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />Predicted Traits</h3>
                  <div className="text-left sm:text-right"><span className="text-xs sm:text-sm text-muted-foreground">Est. Fitness:</span><span className="ml-2 text-xl sm:text-2xl font-bold gradient-text">{predictedFitness}</span></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {predictedTraits.map(({ trait, avg }) => { const Icon = traitIcons[trait as keyof typeof traitIcons]; const color = traitColors[trait as keyof typeof traitColors]; return (
                    <div key={trait} className="p-2 sm:p-3 rounded-lg bg-card">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2"><Icon className="w-3 h-3 sm:w-4 sm:h-4" style={{ color }} /><span className="text-[10px] sm:text-xs capitalize truncate text-muted-foreground">{trait}</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm sm:text-lg font-bold">{avg}</span><span className="text-[10px] sm:text-xs text-muted-foreground">±15</span></div>
                      <div className="h-1 rounded-full mt-1 sm:mt-2 bg-muted"><div className="h-full rounded-full" style={{ width: `${avg}%`, backgroundColor: color }} /></div>
                    </div>
                  );})}
                </div>
              </motion.div>
            )}

            {/* Crossover Type */}
            {parentA && parentB && (
              <motion.div className="mt-4 sm:mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-muted-foreground">CROSSOVER TYPE</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  {CROSSOVER_TYPES.map(type => { const Icon = type.icon; return (
                    <motion.button key={type.id} onClick={() => setCrossoverType(type.id)} className={`p-3 sm:p-4 rounded-xl text-left border-2 ${crossoverType === type.id ? "bg-primary/10 border-primary" : "bg-background border-border"}`}>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${crossoverType === type.id ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="min-w-0"><p className="font-medium text-sm sm:text-base truncate">{type.name}</p><p className="text-[10px] sm:text-xs truncate text-muted-foreground">{type.desc}</p></div>
                        {crossoverType === type.id && <Check className="w-4 h-4 sm:w-5 sm:h-5 ml-auto flex-shrink-0 text-primary" />}
                      </div>
                    </motion.button>
                  );})}
                </div>
              </motion.div>
            )}

            {/* Child Name */}
            {parentA && parentB && (
              <motion.div className="mt-4 sm:mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-xs sm:text-sm font-medium mb-2 text-muted-foreground">CHILD NAME (optional)</p>
                <input type="text" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Enter name" className="w-full p-3 sm:p-4 rounded-xl text-sm sm:text-base outline-none bg-background border-2 border-border focus:border-primary transition-colors" />
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
            {error && (<motion.div className="mt-4 p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3 bg-destructive/10 border border-destructive" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-destructive" /><span className="text-sm text-destructive">{error}</span></motion.div>)}
            {result && (<motion.div className="mt-4 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-primary/10 border border-emerald-500" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}><div className="flex items-center gap-3"><div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-500"><Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" /></div><div><h3 className="font-bold text-sm sm:text-lg">Breeding Request Created!</h3><p className="text-xs sm:text-sm text-muted-foreground">{result.status === "approved" ? "Creating child..." : "Waiting approval..."}</p></div></div></motion.div>)}
          </motion.div>

          {/* Pending */}
          {pendingRequests.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2"><Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />Pending</h2>
              <div className="space-y-2 sm:space-y-3">
                {pendingRequests.map(req => (
                  <div key={req.id} className="p-3 sm:p-4 rounded-xl flex items-center justify-between bg-card border border-border">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0"><Dna className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-primary" /><div className="min-w-0"><p className="text-sm sm:text-base truncate">{req.parentA?.name || "?"} × {req.parentB?.name || "?"}</p><p className="text-[10px] sm:text-sm text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</p></div></div>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 ${req.status === "pending" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>{req.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </main>
        
        {/* Success Modal */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setResult(null);
            setParentA(null);
            setParentB(null);
            setChildName("");
          }}
          child={result?.child || null}
          breeding={result?.breeding || undefined}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function BreedingPage() {
  return (<Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Dna className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse text-primary" /></div>}><BreedingContent /></Suspense>);
}
