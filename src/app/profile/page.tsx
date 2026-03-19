"use client";
export const dynamic = "force-dynamic";
// src/app/profile/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LoginButton } from "@/components/LoginButton";
import { AppHeader } from "@/components/AppHeader";
import { AgentDetailModal } from "@/components/AgentDetailModal";
import { PendingApprovals } from "@/components/PendingApprovals";
import { CoOwnersDisplay } from "@/components/CoOwnersDisplay";
import { Button } from "@/components/ui";
import { useGMDBalance } from "@/hooks/useGMDBalance";
import { useTranslation } from "react-i18next";
import { Dna, Link2, Copy, Check, Clock, Sparkles, Store, Coins, ExternalLink, Activity, Cpu, Heart, Brain, TrendingUp, MessageSquare, GraduationCap, Crown, Palette, ChevronRight, RefreshCw, Star, Zap, Shield, Eye } from "lucide-react";

interface Agent {
  id: string; name: string; botUsername: string | null; dnaHash: string;
  traits: { technical: number; creativity: number; social: number; analysis: number; empathy: number; trading: number; teaching: number; leadership: number; };
  fitness: number; generation: number; isActive: boolean; createdAt: string; commitment: string | null; tokenId: string | null;
}

const traitIcons: Record<string, React.ElementType> = { technical: Cpu, creativity: Palette, social: MessageSquare, analysis: Brain, empathy: Heart, trading: TrendingUp, teaching: GraduationCap, leadership: Crown };
const traitColors: Record<string, string> = { technical: "#3B82F6", creativity: "#EC4899", social: "#8B5CF6", analysis: "#06B6D4", empathy: "#EF4444", trading: "#10B981", teaching: "#F59E0B", leadership: "#F97316" };

function getTopTraits(traits: Agent["traits"]): { key: string; value: number }[] {
  return Object.entries(traits).sort(([, a], [, b]) => b - a).slice(0, 3).map(([key, value]) => ({ key, value }));
}

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { authenticated, ready, user, getAccessToken, logout } = usePrivy();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatted: gmdBalance, isLoading: gmdLoading } = useGMDBalance();
  const [generatingCode, setGeneratingCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  function calculateRarity(traits: Agent["traits"]): { label: string; color: string; bg: string } {
    const values = Object.values(traits);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const spread = max - Math.min(...values);
    if (avg >= 80 && spread <= 20) return { label: t("dashboard.rarity.legendary"), color: "#FBBF24", bg: "rgba(251, 191, 36, 0.1)" };
    if (avg >= 75 || max >= 95) return { label: t("dashboard.rarity.epic"), color: "#A855F7", bg: "rgba(168, 85, 247, 0.1)" };
    if (avg >= 60 || max >= 85) return { label: t("dashboard.rarity.rare"), color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)" };
    if (avg >= 40) return { label: t("dashboard.rarity.uncommon"), color: "#10B981", bg: "rgba(16, 185, 129, 0.1)" };
    return { label: t("dashboard.rarity.common"), color: "#6B7280", bg: "rgba(107, 114, 128, 0.1)" };
  }

  const fetchProfile = useCallback(async () => {
    if (!authenticated) return;
    try { setLoading(true); const token = await getAccessToken(); if (!token) return; const res = await fetch("/api/agents", { headers: { Authorization: `Bearer ${token}` } }); if (res.ok) { const data = await res.json(); setAgents(data.agents || []); } } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [authenticated, getAccessToken]);

  useEffect(() => { if (ready && !authenticated) router.push("/dashboard"); else if (ready && authenticated) fetchProfile(); }, [ready, authenticated, router, fetchProfile]);

  const generateCode = async () => {
    setGeneratingCode(true); setCodeError(null); setVerificationCode(null);
    try { const token = await getAccessToken(); if (!token) { setCodeError(i18n.language === "es" ? "Por favor inicia sesión" : "Please login first"); return; } const res = await fetch("/api/codes/generate", { method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } }); const data = await res.json(); if (!res.ok) { setCodeError(data.error || "Failed"); return; } setVerificationCode(data.code); setCodeExpiry(new Date(data.expiresAt)); } catch (err) { setCodeError(String(err)); } finally { setGeneratingCode(false); }
  };

  const copyCode = () => { if (verificationCode) { navigator.clipboard.writeText(verificationCode); setCopied(true); setTimeout(() => setCopied(false), 2000); } };
  const formatTimeLeft = () => { if (!codeExpiry) return ""; const diff = codeExpiry.getTime() - Date.now(); if (diff <= 0) return i18n.language === "es" ? "Expirado" : "Expired"; return `${Math.floor(diff / 60000)}:${String(Math.floor((diff % 60000) / 1000)).padStart(2, "0")}`; };

  const walletAddress = user?.wallet?.address;
  const shortWallet = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "";

  if (!ready) return (<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg-primary)" }}><Dna className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse" style={{ color: "var(--color-primary)" }} /></div>);
  if (!authenticated) return (<div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ backgroundColor: "var(--color-bg-primary)" }}><Shield className="w-12 h-12 sm:w-16 sm:h-16" style={{ color: "var(--color-primary)" }} /><h1 className="text-xl sm:text-2xl font-bold text-center" style={{ color: "var(--color-text-primary)" }}>{i18n.language === "es" ? "Conecta para continuar" : "Connect to Continue"}</h1><LoginButton /></div>);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <AppHeader />
      <AgentDetailModal agent={selectedAgent ? { ...selectedAgent, isMine: true } : null} isOpen={!!selectedAgent} onClose={() => setSelectedAgent(null)} onAgentUpdated={fetchProfile} getAccessToken={getAccessToken} />

      <main className="max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-8 sm:pb-12">
        {/* Profile Card */}
        <motion.div  className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 gradient-border" style={{ backgroundColor: "var(--color-bg-secondary)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-accent-1))" }}><Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" /></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-4 flex items-center justify-center" style={{ backgroundColor: "var(--color-success)", borderColor: "var(--color-bg-secondary)" }}><Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" /></div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: "var(--color-text-primary)" }}>{shortWallet}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm">
                <span className="flex items-center gap-1 sm:gap-2" style={{ color: "var(--color-text-secondary)" }}><Shield className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: "var(--color-secondary)" }} /><code className="px-1.5 sm:px-2 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--color-bg-tertiary)" }}>{walletAddress?.slice(0, 8)}...</code></span>
              </div>
            </div>
            <div className="flex gap-4 sm:gap-6 md:gap-8 text-center">
              <div><div className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-primary)" }}>{agents.length}</div><div className="text-[10px] sm:text-xs" style={{ color: "var(--color-text-muted)" }}>{i18n.language === "es" ? "AGENTES" : "AGENTS"}</div></div>
              <div><div className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-secondary)" }}>{agents.filter(a => a.isActive).length}</div><div className="text-[10px] sm:text-xs" style={{ color: "var(--color-text-muted)" }}>{i18n.language === "es" ? "ACTIVOS" : "ACTIVE"}</div></div>
              <div><div className="text-2xl sm:text-3xl font-bold" style={{ color: "#FBBF24" }}>{gmdLoading ? "..." : gmdBalance}</div><div className="text-[10px] sm:text-xs" style={{ color: "var(--color-text-muted)" }}>GMD</div></div>
            </div>
          </div>
        </motion.div>

        {/* Pending Approvals */}
        <PendingApprovals getAccessToken={getAccessToken} onActionComplete={fetchProfile} />
        {/* Quick Actions */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <Link href="/breeding">
            <motion.div className="p-4 sm:p-6 rounded-xl flex items-center gap-3 sm:gap-4 cursor-pointer" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-accent-1))" }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Dna className="w-8 h-8 sm:w-10 sm:h-10 text-white flex-shrink-0" />
              <div className="min-w-0"><h3 className="font-bold text-sm sm:text-lg text-white">{t("dashboard.actions.startBreeding")}</h3><p className="text-xs sm:text-sm text-white/80 hidden sm:block">{i18n.language === "es" ? "Cruza tus agentes" : "Cross your agents"}</p></div>
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-auto flex-shrink-0" />
            </motion.div>
          </Link>
          <a href="https://testnet.nad.fun/token/0x03DD45bA22F57b715a2F30C3C945E57DA0AC7777" target="_blank" rel="noopener noreferrer">
            <motion.div className="p-4 sm:p-6 rounded-xl flex items-center gap-3 sm:gap-4 cursor-pointer" style={{ background: "linear-gradient(135deg, #F59E0B, #EAB308)" }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Coins className="w-8 h-8 sm:w-10 sm:h-10 text-white flex-shrink-0" />
              <div className="min-w-0"><h3 className="font-bold text-sm sm:text-lg text-white">{i18n.language === "es" ? "Obtener GMD" : "Get GMD"}</h3><p className="text-xs sm:text-sm text-white/80 hidden sm:block">{i18n.language === "es" ? "Compra en nad.fun" : "Buy on nad.fun"}</p></div>
              <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-auto flex-shrink-0" />
            </motion.div>
          </a>
          <motion.div className="p-4 sm:p-6 rounded-xl flex items-center gap-3 sm:gap-4 opacity-60 cursor-not-allowed" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
            <Store className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" style={{ color: "var(--color-text-muted)" }} />
            <div className="min-w-0"><h3 className="font-bold text-sm sm:text-lg" style={{ color: "var(--color-text-primary)" }}>Marketplace</h3><p className="text-xs sm:text-sm hidden sm:block" style={{ color: "var(--color-text-muted)" }}>{i18n.language === "es" ? "Próximamente..." : "Coming soon..."}</p></div>
          </motion.div>
        </motion.div>

        {/* Link Agent Section */}
        <motion.div className="mb-6 sm:mb-8 rounded-xl p-4 sm:p-6" style={{ background: "linear-gradient(135deg, rgba(0, 170, 147, 0.1), rgba(123, 63, 228, 0.1))", border: "1px solid var(--color-secondary)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}><Link2 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "var(--color-secondary)" }} />{i18n.language === "es" ? "Vincula tu Agente" : "Link Your Agent"}</h2>
          <AnimatePresence mode="wait">
            {!verificationCode ? (
              <motion.div key="generate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-sm mb-3 sm:mb-4" style={{ color: "var(--color-text-secondary)" }}>{i18n.language === "es" ? "Genera un código de verificación para vincular tu agente AI." : "Generate a verification code to link your AI agent."}</p>
                <Button onClick={generateCode} disabled={generatingCode} variant="primary" size="sm">{generatingCode ? <><RefreshCw className="w-4 h-4 animate-spin" />{i18n.language === "es" ? "Generando..." : "Generating..."}</> : <><Sparkles className="w-4 h-4" />{i18n.language === "es" ? "Generar Código" : "Generate Code"}</>}</Button>
                {codeError && <p className="mt-2 text-sm" style={{ color: "var(--color-error)" }}>{codeError}</p>}
              </motion.div>
            ) : (
              <motion.div key="code" className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div>
                  <p className="text-xs sm:text-sm mb-2" style={{ color: "var(--color-text-muted)" }}>{i18n.language === "es" ? "Tu código de verificación:" : "Your verification code:"}</p>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <code className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-wider px-3 sm:px-6 py-2 sm:py-3 rounded-lg" style={{ backgroundColor: "var(--color-bg-tertiary)", border: "2px solid var(--color-secondary)", color: "var(--color-text-primary)" }}>{verificationCode}</code>
                    <motion.button onClick={copyCode} className="p-2 sm:p-3 rounded-lg" style={{ backgroundColor: "var(--color-bg-tertiary)" }} whileTap={{ scale: 0.95 }}>{copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "var(--color-success)" }} /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "var(--color-text-secondary)" }} />}</motion.button>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm flex items-center gap-1 sm:gap-2" style={{ color: "var(--color-warning)" }}><Clock className="w-3 h-3 sm:w-4 sm:h-4" />{i18n.language === "es" ? "Expira:" : "Expires:"} {formatTimeLeft()}</p>
                </div>
                <div className="rounded-lg p-3 sm:p-4" style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
                  <p className="text-xs sm:text-sm" style={{ color: "var(--color-text-secondary)" }}><strong>{i18n.language === "es" ? "Siguiente:" : "Next:"}</strong> {i18n.language === "es" ? "Dile a tu agente:" : "Tell your agent:"}</p>
                  <code className="block mt-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-secondary)" }}>/genomad-verify {verificationCode}</code>
                </div>
                <button onClick={() => { setVerificationCode(null); setCodeExpiry(null); }} className="text-xs sm:text-sm" style={{ color: "var(--color-text-muted)" }}>{i18n.language === "es" ? "Generar nuevo" : "Generate new"}</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* My Agents */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}><Activity className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--color-primary)" }} />{t("profile.stats.agents")}<span className="text-xs sm:text-sm font-normal px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--color-bg-tertiary)", color: "var(--color-text-muted)" }}>{agents.length}</span></h2>
          {loading ? (<div className="text-center py-8 sm:py-12"><Dna className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 animate-pulse" style={{ color: "var(--color-primary)" }} /><p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{t("common.loading")}</p></div>
          ) : agents.length === 0 ? (<div className="text-center py-8 sm:py-12 rounded-xl" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}><Star className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: "var(--color-text-muted)" }} /><h3 className="text-lg sm:text-xl mb-2" style={{ color: "var(--color-text-primary)" }}>{t("profile.empty.title")}</h3><p className="text-sm px-4" style={{ color: "var(--color-text-secondary)" }}>{t("profile.empty.description")}</p></div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent, index) => {
                const rarity = calculateRarity(agent.traits);
                const topTraits = getTopTraits(agent.traits);
                return (
                  <motion.div key={agent.id} className="rounded-xl p-4 sm:p-6 card-hover cursor-pointer" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }} whileHover={{ borderColor: "var(--color-primary)" }} onClick={() => setSelectedAgent(agent)}>
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className="min-w-0"><h3 className="text-lg sm:text-xl font-bold truncate" style={{ color: "var(--color-text-primary)" }}>{agent.name}</h3>{agent.botUsername && <p className="text-xs sm:text-sm truncate" style={{ color: "var(--color-text-muted)" }}>@{agent.botUsername}</p>}</div>
                      <div className="text-right flex-shrink-0 ml-2"><div className="text-xl sm:text-2xl font-bold gradient-text">{agent.fitness.toFixed(1)}</div><div className="text-[10px] sm:text-xs" style={{ color: "var(--color-text-muted)" }}>FITNESS</div></div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-medium flex items-center gap-1" style={{ backgroundColor: rarity.bg, color: rarity.color }}><Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{rarity.label}</span>
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded" style={{ backgroundColor: "var(--color-bg-tertiary)", color: "var(--color-text-secondary)" }}>Gen {agent.generation}</span>
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex items-center gap-1" style={{ backgroundColor: agent.isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", color: agent.isActive ? "var(--color-success)" : "var(--color-error)" }}><span className={`w-1.5 h-1.5 rounded-full ${agent.isActive ? "bg-green-500" : "bg-red-500"}`} />{agent.isActive ? (i18n.language === "es" ? "Activo" : "Active") : "Off"}</span>
                    </div>
                    {/* Co-owners */}
                    <div className="mb-3 sm:mb-4"><CoOwnersDisplay agentId={agent.id} variant="full" getAccessToken={getAccessToken} /></div>
                    <div className="mb-3 sm:mb-4"><p className="text-[10px] sm:text-xs mb-1.5 sm:mb-2" style={{ color: "var(--color-text-muted)" }}>{i18n.language === "es" ? "TOP TRAITS" : "TOP TRAITS"}</p><div className="flex flex-wrap gap-1.5 sm:gap-2">{topTraits.map((trait) => { const Icon = traitIcons[trait.key]; const color = traitColors[trait.key]; return (<span key={trait.key} className="text-[10px] sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex items-center gap-1" style={{ backgroundColor: `${color}15`, color }}><Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{trait.value}</span>);})}</div></div>
                    <div className="pt-3 sm:pt-4" style={{ borderTop: "1px solid var(--color-border)" }}><code className="text-[10px] sm:text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>{(agent.commitment || agent.dnaHash).slice(0, 20)}...</code></div>
                    <div className="mt-3 sm:mt-4 flex gap-2">
                      <button className="flex-1 text-xs sm:text-sm px-3 py-2 rounded-lg gradient-primary text-white font-semibold flex items-center justify-center gap-1" onClick={(e) => { e.stopPropagation(); setSelectedAgent(agent); }}><Eye className="w-3 h-3 sm:w-4 sm:h-4" />{t("dashboard.actions.viewDetails")}</button>
                      <Link href={`/breeding?parentA=${agent.id}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="secondary" size="sm" className="w-full text-xs sm:text-sm"><Dna className="w-3 h-3 sm:w-4 sm:h-4" />{i18n.language === "es" ? "Criar" : "Breed"}</Button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
