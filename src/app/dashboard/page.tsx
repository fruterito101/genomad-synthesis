// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LoginButton } from "@/components/LoginButton";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui";
import { useTranslation } from "react-i18next";
import { 
  Dna, Sparkles, Users, TrendingUp, ArrowRight, Zap, Shield, Crown, Activity,
  Globe, Star, Cpu, Palette, MessageSquare, Brain, Heart, GraduationCap,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  botUsername: string | null;
  traits: {
    technical: number; creativity: number; social: number; analysis: number;
    empathy: number; trading: number; teaching: number; leadership: number;
  };
  fitness: number;
  generation: number;
  isActive: boolean;
  owner?: { wallet: string | null } | null;
}

const traitIcons: Record<string, React.ElementType> = {
  technical: Cpu, creativity: Palette, social: MessageSquare, analysis: Brain,
  empathy: Heart, trading: TrendingUp, teaching: GraduationCap, leadership: Crown,
};

const traitColors: Record<string, string> = {
  technical: "#3B82F6", creativity: "#EC4899", social: "#8B5CF6", analysis: "#06B6D4",
  empathy: "#EF4444", trading: "#10B981", teaching: "#F59E0B", leadership: "#F97316",
};

function getTopTrait(traits: Agent["traits"]): { key: string; value: number } {
  const entries = Object.entries(traits);
  const top = entries.sort(([, a], [, b]) => b - a)[0];
  return { key: top[0], value: top[1] };
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { authenticated, ready, getAccessToken } = usePrivy();
  const router = useRouter();
  const [globalAgents, setGlobalAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState({ totalAgents: 0, activeAgents: 0, totalBreedings: 0 });
  const [loading, setLoading] = useState(true);

  const features = [
    { icon: Dna, title: i18n.language === "es" ? "DNA Único" : "Unique DNA", description: i18n.language === "es" ? "8 traits que definen la personalidad de tu agente" : "8 traits that define your agent's personality", color: "var(--color-primary)" },
    { icon: Sparkles, title: i18n.language === "es" ? "Evolución" : "Evolution", description: i18n.language === "es" ? "Mejora generación tras generación" : "Improve generation after generation", color: "var(--color-secondary)" },
    { icon: Users, title: "Breeding", description: i18n.language === "es" ? "Combina agentes para crear nuevas especies" : "Combine agents to create new species", color: "var(--color-accent-1)" },
    { icon: TrendingUp, title: i18n.language === "es" ? "Rentabilidad" : "Profitability", description: i18n.language === "es" ? "Gana $GMD rentando tus agentes" : "Earn $GMD by renting your agents", color: "#F59E0B" },
  ];

  function getRarity(traits: Agent["traits"]): { label: string; color: string } {
    const values = Object.values(traits);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    if (avg >= 80) return { label: t("dashboard.rarity.legendary"), color: "#FBBF24" };
    if (avg >= 75 || max >= 95) return { label: t("dashboard.rarity.epic"), color: "#A855F7" };
    if (avg >= 60 || max >= 85) return { label: t("dashboard.rarity.rare"), color: "#3B82F6" };
    return { label: t("dashboard.rarity.uncommon"), color: "#10B981" };
  }

  const fetchGlobalData = useCallback(async () => {
    try {
      setLoading(true);
      const statsRes = await fetch("/api/stats");
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats({ totalAgents: data.totalAgents || 0, activeAgents: data.activeAgents || 0, totalBreedings: data.totalBreedings || 0 });
      }
      const agentsRes = await fetch("/api/leaderboard?limit=20");
      if (agentsRes.ok) {
        const data = await agentsRes.json();
        setGlobalAgents(data.agents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGlobalData(); }, [fetchGlobalData]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg-primary)" }}>
        <Dna className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse" style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  // Not authenticated
  if (!authenticated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg-primary)" }}>
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 md:py-20">
          <motion.div  className="text-center mb-10 sm:mb-12 md:mb-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: "var(--color-primary)" }} />
              <span className="text-xs sm:text-sm" style={{ color: "var(--color-text-secondary)" }}>Built on Monad</span>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-2">
              <span style={{ color: "var(--color-text-primary)" }}>{i18n.language === "es" ? "Evoluciona tu " : "Evolve your "}</span>
              <span className="gradient-text">{i18n.language === "es" ? "Agente AI" : "AI Agent"}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 px-4" style={{ color: "var(--color-text-secondary)" }}>
              {t("hero.subtitle")}
            </p>
            <LoginButton />
          </motion.div>

          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} className="p-5 sm:p-6 rounded-xl card-hover" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4" style={{ backgroundColor: `${feature.color}20` }}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2" style={{ color: "var(--color-text-primary)" }}>{feature.title}</h3>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div className="rounded-xl p-5 sm:p-6 md:p-8" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-6">
              <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
                <Globe className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--color-secondary)" }} />
                {i18n.language === "es" ? "Agentes Globales" : "Global Agents"}
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>{globalAgents.length} {i18n.language === "es" ? "agentes activos" : "active agents"}</span>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8"><Dna className="w-8 h-8 mx-auto animate-pulse" style={{ color: "var(--color-primary)" }} /></div>
            ) : globalAgents.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--color-text-muted)" }} />
                <p style={{ color: "var(--color-text-secondary)" }}>{i18n.language === "es" ? "Sé el primero en conectar tu agente" : "Be the first to connect your agent"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {globalAgents.slice(0, 8).map((agent, index) => {
                  const rarity = getRarity(agent.traits);
                  const topTrait = getTopTrait(agent.traits);
                  const TopIcon = traitIcons[topTrait.key];
                  const topColor = traitColors[topTrait.key];
                  return (
                    <motion.div key={agent.id} className="p-4 rounded-xl" style={{ backgroundColor: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ borderColor: "var(--color-primary)", y: -2 }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${topColor}, var(--color-primary))` }}>
                          <TopIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate" style={{ color: "var(--color-text-primary)" }}>{agent.name}</h4>
                          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Gen {agent.generation}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${rarity.color}20`, color: rarity.color }}>{rarity.label}</span>
                        <span className="text-lg font-bold gradient-text">{agent.fitness.toFixed(1)}</span>
                      </div>
                      {agent.isActive && (
                        <div className="mt-2 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-xs" style={{ color: "var(--color-success)" }}>Online</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
            {globalAgents.length > 8 && (
              <div className="mt-4 text-center">
                <Button variant="secondary" size="sm" href="/agents">{t("dashboard.actions.viewDetails")}<ArrowRight className="w-4 h-4" /></Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Authenticated
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <motion.div  className="mb-6 sm:mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2" style={{ color: "var(--color-text-primary)" }}>
            {t("dashboard.welcome")} <span className="gradient-text">Genomad</span>
          </h1>
          <p className="text-sm sm:text-base" style={{ color: "var(--color-text-secondary)" }}>{i18n.language === "es" ? "Tu centro de control para agentes AI evolutivos" : "Your control center for evolutionary AI agents"}</p>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <motion.div className="p-4 sm:p-6 rounded-xl" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }} whileHover={{ borderColor: "var(--color-primary)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>{i18n.language === "es" ? "Agentes Globales" : "Global Agents"}</p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>{stats.totalAgents}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(123, 63, 228, 0.1)" }}>
                <Globe className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--color-primary)" }} />
              </div>
            </div>
          </motion.div>
          <motion.div className="p-4 sm:p-6 rounded-xl" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>{i18n.language === "es" ? "Online Ahora" : "Online Now"}</p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-success)" }}>{stats.activeAgents}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
                <Activity className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--color-success)" }} />
              </div>
            </div>
          </motion.div>
          <motion.div className="p-4 sm:p-6 rounded-xl" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>{t("dashboard.stats.breedings")}</p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-accent-1)" }}>{stats.totalBreedings}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(192, 38, 255, 0.1)" }}>
                <Dna className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--color-accent-1)" }} />
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <motion.div className="p-5 sm:p-6 rounded-xl gradient-border" style={{ backgroundColor: "var(--color-bg-secondary)" }} whileHover={{ y: -4 }}>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--color-secondary), var(--color-primary))" }}>
                <Dna className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2" style={{ color: "var(--color-text-primary)" }}>{i18n.language === "es" ? "Vincula tu Agente" : "Link Your Agent"}</h3>
                <p className="text-sm mb-3 sm:mb-4" style={{ color: "var(--color-text-secondary)" }}>{i18n.language === "es" ? "Conecta tu agente OpenClaw y extrae su DNA único" : "Connect your OpenClaw agent and extract its unique DNA"}</p>
                <Button variant="primary" size="sm" href="/profile">{i18n.language === "es" ? "Ir a Profile" : "Go to Profile"}<ArrowRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </motion.div>
          <motion.div className="p-5 sm:p-6 rounded-xl" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }} whileHover={{ y: -4, borderColor: "var(--color-accent-1)" }}>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--color-accent-1), var(--color-primary))" }}>
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2" style={{ color: "var(--color-text-primary)" }}>{t("dashboard.actions.startBreeding")}</h3>
                <p className="text-sm mb-3 sm:mb-4" style={{ color: "var(--color-text-secondary)" }}>{i18n.language === "es" ? "Combina agentes para crear una nueva generación" : "Combine agents to create a new generation"}</p>
                <Button variant="secondary" size="sm" href="/breeding">{i18n.language === "es" ? "Explorar" : "Explore"}<ArrowRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="rounded-xl p-5 sm:p-6" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
              <Globe className="w-5 h-5" style={{ color: "var(--color-secondary)" }} />
              {i18n.language === "es" ? "Agentes en Genomad" : "Agents in Genomad"}
            </h3>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--color-success)" }}>
              {globalAgents.filter(a => a.isActive).length} online
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8"><Dna className="w-8 h-8 mx-auto animate-pulse" style={{ color: "var(--color-primary)" }} /></div>
          ) : globalAgents.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--color-text-muted)" }} />
              <p className="mb-4" style={{ color: "var(--color-text-secondary)" }}>{t("dashboard.noAgents")}</p>
              <Button variant="primary" size="sm" href="/profile">{i18n.language === "es" ? "Sé el primero" : "Be the first"}<ArrowRight className="w-4 h-4" /></Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {globalAgents.map((agent, index) => {
                const rarity = getRarity(agent.traits);
                const topTrait = getTopTrait(agent.traits);
                const TopIcon = traitIcons[topTrait.key];
                const topColor = traitColors[topTrait.key];
                return (
                  <motion.div key={agent.id} className="p-4 rounded-xl cursor-pointer" style={{ backgroundColor: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} whileHover={{ borderColor: "var(--color-primary)", y: -2 }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${topColor}, var(--color-primary))` }}>
                        <TopIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate" style={{ color: "var(--color-text-primary)" }}>{agent.name}</h4>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Gen {agent.generation} {agent.owner?.wallet ? `• ${agent.owner.wallet.slice(0,4)}...` : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${rarity.color}20`, color: rarity.color }}>{rarity.label}</span>
                        {agent.isActive && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                      </div>
                      <span className="text-lg font-bold gradient-text">{agent.fitness.toFixed(1)}</span>
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
