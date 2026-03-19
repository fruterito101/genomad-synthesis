// src/app/agents/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui";
import { useTranslation } from "react-i18next";
import { 
  Search, Filter, ExternalLink, Star, Crown, Cpu, Palette, 
  MessageSquare, Brain, Heart, TrendingUp, GraduationCap,
  ChevronDown, X, Dna, Sparkles, Activity
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

const traitConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  technical: { icon: Cpu, color: "#3B82F6", label: "Técnico" },
  creativity: { icon: Palette, color: "#EC4899", label: "Creativo" },
  social: { icon: MessageSquare, color: "#8B5CF6", label: "Social" },
  analysis: { icon: Brain, color: "#06B6D4", label: "Analítico" },
  empathy: { icon: Heart, color: "#EF4444", label: "Empático" },
  trading: { icon: TrendingUp, color: "#10B981", label: "Trader" },
  teaching: { icon: GraduationCap, color: "#F59E0B", label: "Maestro" },
  leadership: { icon: Crown, color: "#F97316", label: "Líder" },
};

function getRarity(traits: Agent["traits"]): { label: string; color: string; bg: string; priority: number } {
  const values = Object.values(traits);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  const spread = max - Math.min(...values);
  
  if (avg >= 80 && spread <= 20) return { label: "Legendario", color: "#FBBF24", bg: "rgba(251, 191, 36, 0.15)", priority: 4 };
  if (avg >= 75 || max >= 95) return { label: "Épico", color: "#A855F7", bg: "rgba(168, 85, 247, 0.15)", priority: 3 };
  if (avg >= 60 || max >= 85) return { label: "Raro", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)", priority: 2 };
  if (avg >= 40) return { label: "Poco Común", color: "#10B981", bg: "rgba(16, 185, 129, 0.15)", priority: 1 };
  return { label: "Común", color: "#6B7280", bg: "rgba(107, 114, 128, 0.15)", priority: 0 };
}

function getTopTraits(traits: Agent["traits"], count: number = 3): { key: string; value: number }[] {
  return Object.entries(traits)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([key, value]) => ({ key, value }));
}

function getSpecialization(traits: Agent["traits"]): { key: string; label: string; color: string } {
  const top = Object.entries(traits).sort(([, a], [, b]) => b - a)[0];
  const config = traitConfig[top[0]];
  return { key: top[0], label: config?.label || top[0], color: config?.color || "#7B3FE4" };
}

export default function AgentsPage() {
  const { i18n } = useTranslation();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTrait, setFilterTrait] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchAgents = async () => {
      try {
        setFetchError(null);
        const res = await fetch("/api/leaderboard?limit=50", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" }
        });
        if (res.ok) {
          const data = await res.json();
          console.log("[AgentsPage] Loaded agents:", data.agents?.length || 0);
          setAgents(data.agents || []);
        } else {
          console.error("[AgentsPage] API error:", res.status);
          setFetchError(`API error: ${res.status}`);
        }
      } catch (err) {
        console.error("[AgentsPage] Fetch error:", err);
        setFetchError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [mounted]);

  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    let result = [...agents];
    
    // Search filter
    if (searchQuery) {
      result = result.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Trait filter
    if (filterTrait) {
      result = result.filter(a => {
        const top = getSpecialization(a.traits);
        return top.key === filterTrait;
      });
    }
    
    // Sort by fitness (best first)
    result.sort((a, b) => b.fitness - a.fitness);
    
    return result;
  }, [agents, searchQuery, filterTrait]);

  // Show nothing until mounted (prevents hydration mismatch)
  if (!mounted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg-primary)" }}>
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-8 sm:pb-12">
          <div className="text-center py-12">
            <Dna className="w-12 h-12 mx-auto animate-pulse" style={{ color: "var(--color-primary)" }} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-8 sm:pb-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            <span className="gradient-text">Catálogo de Agentes</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg" style={{ color: "var(--color-text-secondary)" }}>
            Explora los agentes disponibles para adopción y breeding
          </p>
        </motion.div>

        {/* Filters Bar */}
        <motion.div 
          className="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8"
          style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                style={{ 
                  backgroundColor: "var(--color-bg-primary)", 
                  border: "2px solid var(--color-border)",
                  color: "var(--color-text-primary)"
                }}
              />
            </div>

            {/* Filter by Trait */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium w-full sm:w-auto justify-center"
                style={{ 
                  backgroundColor: filterTrait ? "rgba(123, 63, 228, 0.1)" : "var(--color-bg-primary)",
                  border: filterTrait ? "2px solid var(--color-primary)" : "2px solid var(--color-border)",
                  color: filterTrait ? "var(--color-primary)" : "var(--color-text-secondary)"
                }}
              >
                <Filter className="w-4 h-4" />
                {filterTrait ? traitConfig[filterTrait]?.label : "Todas"}
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {showFilterMenu && (
                  <motion.div
                    className="absolute top-full left-0 right-0 sm:right-auto mt-2 rounded-xl overflow-hidden z-20 min-w-[200px]"
                    style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <button
                      onClick={() => { setFilterTrait(null); setShowFilterMenu(false); }}
                      className="w-full p-3 text-left text-sm flex items-center gap-2 hover:bg-[var(--color-bg-tertiary)]"
                      style={{ color: "var(--color-text-secondary)", borderBottom: "1px solid var(--color-border)" }}
                    >
                      <X className="w-4 h-4" />
                      Todos
                    </button>
                    {Object.entries(traitConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => { setFilterTrait(key); setShowFilterMenu(false); }}
                          className="w-full p-3 text-left text-sm flex items-center gap-2 hover:bg-[var(--color-bg-tertiary)]"
                          style={{ color: "var(--color-text-primary)", borderBottom: "1px solid var(--color-border)" }}
                        >
                          <Icon className="w-4 h-4" style={{ color: config.color }} />
                          {config.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Breeding Button */}
            <Link href="/breeding">
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                Ver Todos
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="flex flex-wrap gap-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
            <Dna className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {filteredAgents.length} agentes
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
            <Activity className="w-4 h-4" style={{ color: "var(--color-success)" }} />
            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {filteredAgents.filter(a => a.isActive).length} online
            </span>
          </div>
        </motion.div>

        {/* Error Message */}
        {fetchError && (
          <div className="text-center py-4 mb-4 rounded-lg" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
            <p className="text-red-400 text-sm">Error: {fetchError}</p>
          </div>
        )}

        {/* Agents Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Dna className="w-12 h-12 mx-auto animate-pulse" style={{ color: "var(--color-primary)" }} />
            <p className="mt-4 text-sm" style={{ color: "var(--color-text-muted)" }}>Cargando agentes...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--color-text-muted)" }} />
            <p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>
              No se encontraron agentes
            </p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredAgents.map((agent, index) => {
              const rarity = getRarity(agent.traits);
              const topTraits = getTopTraits(agent.traits, 3);
              const specialization = getSpecialization(agent.traits);
              const SpecIcon = traitConfig[specialization.key]?.icon || Star;
              
              return (
                <motion.div
                  key={agent.id}
                  className="rounded-xl overflow-hidden cursor-pointer group"
                  style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ borderColor: "var(--color-primary)", y: -4 }}
                >
                  {/* Avatar Circle */}
                  <div className="p-6 pb-4 flex flex-col items-center">
                    <div 
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 relative"
                      style={{ background: `linear-gradient(135deg, ${specialization.color}, var(--color-primary))` }}
                    >
                      <SpecIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                      {agent.isActive && (
                        <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2" style={{ borderColor: "var(--color-bg-secondary)" }} />
                      )}
                    </div>
                    
                    {/* Name */}
                    <h3 className="text-lg font-bold text-center mb-1" style={{ color: "var(--color-text-primary)" }}>
                      {agent.name}
                    </h3>
                    
                    {/* Fitness */}
                    <p className="text-2xl font-bold gradient-text mb-2">{agent.fitness.toFixed(1)}</p>
                    
                    {/* Rarity Badge */}
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                      style={{ backgroundColor: rarity.bg, color: rarity.color }}
                    >
                      <Star className="w-3 h-3" />
                      {rarity.label}
                    </span>
                  </div>
                  
                  {/* Info Section */}
                  <div className="p-4 pt-0">
                    {/* Top Traits */}
                    <div className="mb-3">
                      <p className="text-[10px] mb-2" style={{ color: "var(--color-text-muted)" }}>MEJORES CUALIDADES</p>
                      <div className="flex flex-wrap gap-1.5">
                        {topTraits.map(({ key, value }) => {
                          const config = traitConfig[key];
                          const Icon = config?.icon || Star;
                          return (
                            <span 
                              key={key}
                              className="text-xs px-2 py-1 rounded flex items-center gap-1"
                              style={{ backgroundColor: `${config?.color}15`, color: config?.color }}
                            >
                              <Icon className="w-3 h-3" />
                              {value}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Specialization */}
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                      <div className="flex items-center gap-2">
                        <SpecIcon className="w-4 h-4" style={{ color: specialization.color }} />
                        <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                          {specialization.label}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        Gen {agent.generation}
                      </span>
                    </div>
                  </div>
                  
                  {/* Hover Action */}
                  <div 
                    className="p-4 pt-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Link href={`/breeding?parentB=${agent.id}`}>
                      <Button variant="primary" size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4" />
                        Visitar
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
}
