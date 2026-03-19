"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingState, EmptyState, AgentCardSkeleton } from "@/components/FallbackUI";
import { 
  Search, Filter, Star, Crown, Cpu, Palette, 
  MessageSquare, Brain, Heart, TrendingUp, GraduationCap,
  ChevronDown, X, Dna, Users
} from "lucide-react";
import {
  isValidAgent,
  shouldShowAgent,
  safeTraits,
  safeFitness,
  safeName,
  safeRarity,
  safeTopTraits,
  sanitizeAgentList,
  TRAIT_NAMES,
  type Agent,
} from "@/lib/utils/agent-validation";

interface Props {
  initialAgents: unknown[];
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

// 🛡️ Safe specialization getter
function getSpecialization(traits: unknown) {
  const safe = safeTraits(traits);
  const top = TRAIT_NAMES
    .map(key => ({ key, value: safe[key] }))
    .sort((a, b) => b.value - a.value)[0];
  
  const config = traitConfig[top.key];
  return { 
    key: top.key, 
    label: config?.label || top.key, 
    color: config?.color || "#7B3FE4" 
  };
}

// 🃏 Safe Agent Card Component
function AgentCard({ agent }: { agent: Agent }) {
  const name = safeName(agent.name);
  const traits = safeTraits(agent.traits);
  const fitness = safeFitness(agent.fitness);
  const rarity = safeRarity(agent.traits);
  const topTraits = safeTopTraits(agent.traits, 2);
  
  // Gradiente basado en top traits
  const gradientColors = topTraits.length >= 2
    ? [traitConfig[topTraits[0].key]?.color || "#7B3FE4", traitConfig[topTraits[1].key]?.color || "#00AA93"]
    : ["#7B3FE4", "#00AA93"];
  
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-purple-500/50 transition cursor-pointer group">
      {/* Avatar */}
      <div 
        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-105"
        style={{ background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})` }}
      >
        <Dna className="w-8 h-8 text-white/80" />
      </div>
      
      {/* Nombre */}
      <h3 className="text-center font-semibold text-white mb-1 truncate" title={name}>
        {name}
      </h3>
      
      {/* Rareza */}
      <div className="flex items-center justify-center gap-1 mb-2">
        <Star className="w-3 h-3" style={{ color: rarity.color }} fill={rarity.color} />
        <span className="text-xs font-medium" style={{ color: rarity.color }}>
          {rarity.label}
        </span>
      </div>
      
      {/* Top Traits */}
      <p className="text-center text-xs text-gray-400 mb-3">
        {topTraits.map((t, i) => (
          <span key={t.key}>
            {traitConfig[t.key]?.label || t.key}
            {i < topTraits.length - 1 && " • "}
          </span>
        ))}
      </p>
      
      {/* Fitness */}
      <p className="text-center text-lg font-bold" style={{ color: rarity.color }}>
        {fitness.toFixed(1)}
      </p>
    </div>
  );
}

// 📋 Main Catalog Component
function AgentsCatalogContent({ initialAgents }: Props) {
  // 🛡️ Sanitizar agentes al cargar
  const sanitizedAgents = useMemo(() => {
    return sanitizeAgentList(initialAgents);
  }, [initialAgents]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTrait, setFilterTrait] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // 🔍 Filtrar agentes de forma segura
  const filteredAgents = useMemo(() => {
    let result = [...sanitizedAgents];
    
    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => {
        const name = safeName(a.name).toLowerCase();
        return name.includes(query);
      });
    }
    
    // Filtrar por trait
    if (filterTrait) {
      result = result.filter(a => {
        const spec = getSpecialization(a.traits);
        return spec.key === filterTrait;
      });
    }
    
    // Ordenar por fitness (de forma segura)
    return result.sort((a, b) => safeFitness(b.fitness) - safeFitness(a.fitness));
  }, [sanitizedAgents, searchQuery, filterTrait]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setFilterTrait(null);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-8 sm:pb-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            <span className="gradient-text">Catálogo de Agentes</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg" style={{ color: "var(--color-text-secondary)" }}>
            Explora los agentes disponibles para adopción y breeding
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          
          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm hover:border-purple-500 transition"
            >
              <Filter className="w-4 h-4" />
              {filterTrait ? traitConfig[filterTrait]?.label : "Todas"}
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showFilterMenu && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10">
                <button
                  onClick={() => { setFilterTrait(null); setShowFilterMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800 rounded-t-lg"
                >
                  Todas
                </button>
                {TRAIT_NAMES.map(trait => (
                  <button
                    key={trait}
                    onClick={() => { setFilterTrait(trait); setShowFilterMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800 flex items-center gap-2"
                  >
                    <span style={{ color: traitConfig[trait]?.color }}>
                      {traitConfig[trait]?.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Clear button */}
          {(searchQuery || filterTrait) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm hover:bg-red-500/30 transition"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>
        
        {/* Results count */}
        <p className="text-sm text-gray-400 mb-4">
          {filteredAgents.length} agente{filteredAgents.length !== 1 ? "s" : ""} encontrado{filteredAgents.length !== 1 ? "s" : ""}
        </p>
        
        {/* Grid */}
        {filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAgents.map((agent) => (
              <ErrorBoundary key={agent.id} fallback={<AgentCardSkeleton />}>
                <AgentCard agent={agent} />
              </ErrorBoundary>
            ))}
          </div>
        ) : (
          <EmptyState 
            message={searchQuery || filterTrait 
              ? "No se encontraron agentes con esos filtros" 
              : "No hay agentes registrados aún"
            }
            icon={Users}
          />
        )}
      </main>
    </div>
  );
}

// 🛡️ Export with Error Boundary
export default function AgentsCatalog(props: Props) {
  return (
    <ErrorBoundary>
      <AgentsCatalogContent {...props} />
    </ErrorBoundary>
  );
}
