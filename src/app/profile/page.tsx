"use client"
import dynamicImport from "next/dynamic";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LoginButton } from "@/components/LoginButton";
const AgentDetailModal = dynamicImport(
  () => import("@/components/AgentDetailModal").then(mod => ({ default: mod.AgentDetailModal })),
  { ssr: false }
);
import { AgentCard } from "@/components/agent-card";
import { PendingApprovals } from "@/components/PendingApprovals";
import { BreedingRequests } from "@/components/BreedingRequests";
import { CoOwnersDisplay } from "@/components/CoOwnersDisplay";
import { NetworkSwitcher } from "@/components/NetworkSwitcher";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui";
import { useGMDBalance } from "@/hooks/useGMDBalance";
import { useTranslation } from "react-i18next";
import { Dna, Link2, Copy, Check, Clock, Sparkles, Store, Coins, ExternalLink, Activity, Cpu, Heart, Brain, TrendingUp, MessageSquare, GraduationCap, Crown, Palette, ChevronRight, RefreshCw, Star, Zap, Shield, Eye, Download, Terminal } from "lucide-react";

interface Agent {
  id: string; name: string; botUsername: string | null; dnaHash: string;
  traits: { technical: number; creativity: number; social: number; analysis: number; empathy: number; trading: number; teaching: number; leadership: number; };
  fitness: number; generation: number; isActive: boolean; createdAt: string; commitment: string | null; tokenId: string | null;
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
  const [copied, setCopied] = useState(false)
  const [walletCopied, setWalletCopied] = useState(false)
  const [skillCopied, setSkillCopied] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);


  const fetchProfile = useCallback(async () => {
    if (!authenticated) return;
    try { setLoading(true); const token = await getAccessToken(); if (!token) return; const res = await fetch("/api/agents", { headers: { Authorization: `Bearer ${token}` } }); if (res.ok) { const data = await res.json(); setAgents(data.agents || []); } } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [authenticated, getAccessToken]);

  useEffect(() => { if (ready && !authenticated) router.push("/dashboard"); else if (ready && authenticated) fetchProfile(); }, [ready, authenticated, router, fetchProfile]);

  const generateCode = async () => {
    setGeneratingCode(true); setCodeError(null); setVerificationCode(null);
    try { const token = await getAccessToken(); if (!token) { setCodeError(i18n.language === "es" ? "Por favor inicia sesión" : "Please login first"); return; } const res = await fetch("/api/codes/generate", { method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } }); const data = await res.json(); if (!res.ok) { setCodeError(data.error || "Failed"); return; } setVerificationCode(data.code); setCodeExpiry(new Date(data.expiresAt)); } catch (err) { setCodeError(String(err)); } finally { setGeneratingCode(false); }
  };


  const copySkillCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd)
    setSkillCopied(cmd)
    setTimeout(() => setSkillCopied(null), 2000)
  }

  const copyWallet = () => { if (walletAddress) { navigator.clipboard.writeText(walletAddress); setWalletCopied(true); setTimeout(() => setWalletCopied(false), 2000); } };
  const copyCode = () => { if (verificationCode) { navigator.clipboard.writeText(verificationCode); setCopied(true); setTimeout(() => setCopied(false), 2000); } };
  const formatTimeLeft = () => { if (!codeExpiry) return ""; const diff = codeExpiry.getTime() - Date.now(); if (diff <= 0) return i18n.language === "es" ? "Expirado" : "Expired"; return `${Math.floor(diff / 60000)}:${String(Math.floor((diff % 60000) / 1000)).padStart(2, "0")}`; };

  const walletAddress = user?.wallet?.address;
  const shortWallet = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "";

  if (!ready) return (<div className="min-h-screen flex items-center justify-center bg-background"><Dna className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse text-primary" /></div>);
  if (!authenticated) return (<div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-background"><Shield className="w-12 h-12 sm:w-16 sm:h-16 text-primary" /><h1 className="text-xl sm:text-2xl font-bold text-center">{i18n.language === "es" ? "Conecta para continuar" : "Connect to Continue"}</h1><LoginButton /></div>);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-semibold">{i18n.language === "es" ? "Mi Perfil" : "My Profile"}</h1>
          <div className="flex-1" />
          <NetworkSwitcher />
        </header>
        
        <AgentDetailModal agent={selectedAgent ? { ...selectedAgent, isMine: true } : null} isOpen={!!selectedAgent} onClose={() => setSelectedAgent(null)} onAgentUpdated={fetchProfile} getAccessToken={getAccessToken} />

        <main className="flex-1 p-4 lg:p-6">
          {/* Profile Card */}
          <motion.div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-border bg-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-accent"><Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" /></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-4 border-card flex items-center justify-center bg-emerald-500"><Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" /></div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{shortWallet}</h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm">
                  <button onClick={copyWallet} className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title={walletAddress}>{walletCopied ? <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />}<code className="px-1.5 sm:px-2 py-0.5 rounded text-xs bg-muted hover:bg-muted/80">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</code></button>
                </div>
              </div>
              <div className="flex gap-4 sm:gap-6 md:gap-8 text-center">
                <div><div className="text-2xl sm:text-3xl font-bold text-primary">{agents.length}</div><div className="text-[10px] sm:text-xs text-muted-foreground">{i18n.language === "es" ? "AGENTES" : "AGENTS"}</div></div>
                <div><div className="text-2xl sm:text-3xl font-bold text-secondary">{agents.filter(a => a.isActive).length}</div><div className="text-[10px] sm:text-xs text-muted-foreground">{i18n.language === "es" ? "ACTIVOS" : "ACTIVE"}</div></div>
                <div><div className="text-2xl sm:text-3xl font-bold text-amber-500">{gmdLoading ? "..." : gmdBalance}</div><div className="text-[10px] sm:text-xs text-muted-foreground">GMD</div></div>
              </div>
            </div>
          </motion.div>

          {/* Pending Approvals */}
          <PendingApprovals getAccessToken={getAccessToken} onActionComplete={fetchProfile} />
          
          {/* Breeding Requests - Aceptar/Rechazar */}
          <BreedingRequests onUpdate={fetchProfile} />

          {/* Quick Actions */}
          <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <Link href="/breeding">
              <motion.div className="p-4 sm:p-6 rounded-xl flex items-center gap-3 sm:gap-4 cursor-pointer bg-gradient-to-r from-primary to-accent" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Dna className="w-8 h-8 sm:w-10 sm:h-10 text-white flex-shrink-0" />
                <div className="min-w-0"><h3 className="font-bold text-sm sm:text-lg text-white">{t("dashboard.actions.startBreeding")}</h3><p className="text-xs sm:text-sm text-white/80 hidden sm:block">{i18n.language === "es" ? "Cruza tus agentes" : "Cross your agents"}</p></div>
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-auto flex-shrink-0" />
              </motion.div>
            </Link>
            <a href="https://testnet.nad.fun/token/0x03DD45bA22F57b715a2F30C3C945E57DA0AC7777" target="_blank" rel="noopener noreferrer">
              <motion.div className="p-4 sm:p-6 rounded-xl flex items-center gap-3 sm:gap-4 cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-500" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Coins className="w-8 h-8 sm:w-10 sm:h-10 text-white flex-shrink-0" />
                <div className="min-w-0"><h3 className="font-bold text-sm sm:text-lg text-white">{i18n.language === "es" ? "Obtener GMD" : "Get GMD"}</h3><p className="text-xs sm:text-sm text-white/80 hidden sm:block">{i18n.language === "es" ? "Compra en nad.fun" : "Buy on nad.fun"}</p></div>
                <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-auto flex-shrink-0" />
              </motion.div>
            </a>
            <motion.div className="p-4 sm:p-6 rounded-xl flex items-center gap-3 sm:gap-4 opacity-60 cursor-not-allowed bg-card border border-border">
              <Store className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 text-muted-foreground" />
              <div className="min-w-0"><h3 className="font-bold text-sm sm:text-lg">Marketplace</h3><p className="text-xs sm:text-sm hidden sm:block text-muted-foreground">{i18n.language === "es" ? "Próximamente..." : "Coming soon..."}</p></div>
            </motion.div>
          </motion.div>


          {/* Skill Installation Section */}
          <motion.div className="mb-6 sm:mb-8 rounded-xl p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              {i18n.language === "es" ? "1. Instala el Skill" : "1. Install the Skill"}
            </h2>
            <p className="text-sm mb-4 text-muted-foreground">
              {i18n.language === "es" 
                ? "Primero, instala el skill de Genomad en tu agente OpenClaw:" 
                : "First, install the Genomad skill on your OpenClaw agent:"}
            </p>
            
            {/* ClawHub command */}
            <div className="space-y-3">
              <div className="rounded-lg p-3 sm:p-4 bg-muted">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Terminal className="w-3 h-3 sm:w-4 sm:h-4" />
                  {i18n.language === "es" ? "Dile a tu agente:" : "Tell your agent:"}
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 block px-3 py-2 rounded text-xs sm:text-sm bg-background text-primary font-mono overflow-x-auto">
                    Instala el skill genomad-verify de ClawHub
                  </code>
                  <motion.button 
                    onClick={() => copySkillCommand("Instala el skill genomad-verify de ClawHub")}
                    className="p-2 rounded-lg bg-background flex-shrink-0"
                    whileTap={{ scale: 0.95 }}
                  >
                    {skillCopied === "Instala el skill genomad-verify de ClawHub" 
                      ? <Check className="w-4 h-4 text-emerald-500" /> 
                      : <Copy className="w-4 h-4 text-muted-foreground" />}
                  </motion.button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {i18n.language === "es" ? "O alternativamente:" : "Or alternatively:"}
              </p>
              
              <div className="rounded-lg p-3 sm:p-4 bg-muted">
                <div className="flex items-center gap-2">
                  <code className="flex-1 block px-3 py-2 rounded text-xs sm:text-sm bg-background text-secondary font-mono overflow-x-auto">
                    clawhub install fruterito101/genomad-verify
                  </code>
                  <motion.button 
                    onClick={() => copySkillCommand("clawhub install fruterito101/genomad-verify")}
                    className="p-2 rounded-lg bg-background flex-shrink-0"
                    whileTap={{ scale: 0.95 }}
                  >
                    {skillCopied === "clawhub install fruterito101/genomad-verify" 
                      ? <Check className="w-4 h-4 text-emerald-500" /> 
                      : <Copy className="w-4 h-4 text-muted-foreground" />}
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <a 
                href="https://github.com/fruterito101/genomad-verify-skill" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                {i18n.language === "es" ? "Ver código fuente en GitHub" : "View source code on GitHub"}
              </a>
            </div>
          </motion.div>

          {/* Link Agent Section */}
          <motion.div className="mb-6 sm:mb-8 rounded-xl p-4 sm:p-6 bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2"><Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />{i18n.language === "es" ? "2. Vincula tu Agente" : "2. Link Your Agent"}</h2>
            <AnimatePresence mode="wait">
              {!verificationCode ? (
                <motion.div key="generate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-sm mb-3 sm:mb-4 text-muted-foreground">{i18n.language === "es" ? "Genera un código de verificación para vincular tu agente AI." : "Generate a verification code to link your AI agent."}</p>
                  <Button onClick={generateCode} disabled={generatingCode} variant="primary" size="sm">{generatingCode ? <><RefreshCw className="w-4 h-4 animate-spin" />{i18n.language === "es" ? "Generando..." : "Generating..."}</> : <><Sparkles className="w-4 h-4" />{i18n.language === "es" ? "Generar Código" : "Generate Code"}</>}</Button>
                  {codeError && <p className="mt-2 text-sm text-destructive">{codeError}</p>}
                </motion.div>
              ) : (
                <motion.div key="code" className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div>
                    <p className="text-xs sm:text-sm mb-2 text-muted-foreground">{i18n.language === "es" ? "Tu código de verificación:" : "Your verification code:"}</p>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <code className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-wider px-3 sm:px-6 py-2 sm:py-3 rounded-lg bg-muted border-2 border-secondary">{verificationCode}</code>
                      <motion.button onClick={copyCode} className="p-2 sm:p-3 rounded-lg bg-muted" whileTap={{ scale: 0.95 }}>{copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />}</motion.button>
                    </div>
                    <p className="mt-2 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 text-amber-500"><Clock className="w-3 h-3 sm:w-4 sm:h-4" />{i18n.language === "es" ? "Expira:" : "Expires:"} {formatTimeLeft()}</p>
                  </div>
                  <div className="rounded-lg p-3 sm:p-4 bg-muted">
                    <p className="text-xs sm:text-sm text-muted-foreground"><strong>{i18n.language === "es" ? "Siguiente:" : "Next:"}</strong> {i18n.language === "es" ? "Dile a tu agente:" : "Tell your agent:"}</p>
                    <code className="block mt-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm bg-background text-secondary">/genomad-verify {verificationCode}</code>
                  </div>
                  <button onClick={() => { setVerificationCode(null); setCodeExpiry(null); }} className="text-xs sm:text-sm text-muted-foreground">{i18n.language === "es" ? "Generar nuevo" : "Generate new"}</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* My Agents */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2"><Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />{t("profile.stats.agents")}<span className="text-xs sm:text-sm font-normal px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{agents.length}</span></h2>
            {loading ? (<div className="text-center py-8 sm:py-12"><Dna className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 animate-pulse text-primary" /><p className="text-sm text-muted-foreground">{t("common.loading")}</p></div>
            ) : agents.length === 0 ? (<div className="text-center py-8 sm:py-12 rounded-xl bg-card border border-border"><Star className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" /><h3 className="text-lg sm:text-xl mb-2">{t("profile.empty.title")}</h3><p className="text-sm px-4 text-muted-foreground">{t("profile.empty.description")}</p></div>
            ) : (
<div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent, index) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isMine
                    variant="full"
                    index={index}
                    showActions
                    showCoOwners
                    showTopTraits
                    getAccessToken={getAccessToken}
                    onClick={() => setSelectedAgent(agent)}
                    onActivated={fetchProfile}
                    onViewDetails={() => setSelectedAgent(agent)}
                    labels={{
                      breed: i18n.language === "es" ? "Criar" : "Breed",
                      viewDetails: t("dashboard.actions.viewDetails"),
                      active: i18n.language === "es" ? "Activo" : "Active",
                      inactive: "Off",
                      activate: i18n.language === "es" ? "Activar Monad" : "Activate Monad",
                      onChain: "On-Chain",
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
