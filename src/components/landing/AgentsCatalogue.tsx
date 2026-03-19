// src/components/landing/AgentsCatalogue.tsx
"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Star, Dna, Search, ChevronDown } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

interface Agent {
  id: string;
  name: string;
  traits: Record<string, number>;
  fitness: number;
  generation: number;
  isActive: boolean;
}

interface Props {
  initialAgents?: Agent[];
}

const CIRCLE_COLORS = [
  "linear-gradient(135deg, #C026FF, #7B3FE4)",
  "linear-gradient(135deg, #00AA93, #7B3FE4)",
];

const TRAIT_OPTIONS = [
  { key: "all", label: "Todas" },
  { key: "technical", label: "Técnico" },
  { key: "creativity", label: "Creativo" },
  { key: "social", label: "Social" },
  { key: "analysis", label: "Analítico" },
  { key: "empathy", label: "Empático" },
  { key: "trading", label: "Trader" },
  { key: "teaching", label: "Maestro" },
  { key: "leadership", label: "Líder" },
];

function getRarity(traits: Record<string, number>): { label: string; color: string } {
  const values = Object.values(traits).filter(v => typeof v === "number" && v > 0);
  if (values.length === 0) return { label: "Común", color: "#10B981" };
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  if (avg >= 80) return { label: "Legendario", color: "#FBBF24" };
  if (avg >= 75 || max >= 95) return { label: "Épico", color: "#A855F7" };
  if (avg >= 60 || max >= 85) return { label: "Raro", color: "#3B82F6" };
  return { label: "Común", color: "#10B981" };
}

function getTopTraits(traits: Record<string, number>): string[] {
  return Object.entries(traits)
    .filter(([k, v]) => k !== "skillCount" && typeof v === "number")
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 2)
    .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));
}

function getTopTrait(traits: Record<string, number>): string {
  const entries = Object.entries(traits).filter(([k]) => k !== "skillCount");
  const sorted = entries.sort(([, a], [, b]) => (b as number) - (a as number));
  return sorted[0]?.[0] || "technical";
}

export function AgentsCatalogue({ initialAgents = [] }: Props) {
  const { i18n } = useTranslation();
  const [agents] = useState<Agent[]>(initialAgents);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrait, setSelectedTrait] = useState("all");

  const filteredAgents = useMemo(() => {
    let result = [...agents];
    if (searchQuery.trim()) {
      result = result.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedTrait !== "all") {
      result = result.filter(a => getTopTrait(a.traits) === selectedTrait);
    }
    return result;
  }, [agents, searchQuery, selectedTrait]);

  // Fill with placeholders to always show 8 cards
  const displayAgents = [...filteredAgents];
  while (displayAgents.length < 8) {
    displayAgents.push({
      id: `placeholder-${displayAgents.length}`,
      name: "",
      traits: {},
      fitness: 0,
      generation: 0,
      isActive: false,
    });
  }

  return (
    <section id="catalogue" className="py-16 sm:py-20 md:py-24" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-10 sm:mb-12" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{i18n.language === "es" ? "Catálogo de Agentes" : "Agent Catalogue"}</span>
          </h2>
          <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
            {i18n.language === "es" ? "Explora los agentes disponibles para adopción y breeding" : "Explore agents available for adoption and breeding"}
          </p>
        </motion.div>

        <motion.div className="rounded-2xl p-4 sm:p-6 md:p-8" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={i18n.language === "es" ? "Buscar por nombre..." : "Search by name..."}
                  className="pl-10 pr-4 py-2 rounded-lg text-sm w-full sm:w-48 outline-none"
                  style={{ backgroundColor: "var(--color-bg-tertiary)", color: "var(--color-text-primary)", border: "1px solid var(--color-border)" }} />
              </div>
              <div className="relative">
                <select value={selectedTrait} onChange={(e) => setSelectedTrait(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 rounded-lg text-sm w-full sm:w-40 outline-none cursor-pointer"
                  style={{ backgroundColor: "var(--color-bg-tertiary)", color: "var(--color-text-primary)", border: "1px solid var(--color-border)" }}>
                  {TRAIT_OPTIONS.map(opt => (<option key={opt.key} value={opt.key}>{opt.label}</option>))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--color-text-muted)" }} />
              </div>
            </div>
            <Link href="/agents">
              <div className="px-6 py-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity text-center" style={{ backgroundColor: "var(--color-primary)" }}>
                <span className="text-white font-medium text-sm">{i18n.language === "es" ? "Ver Todos" : "View All"}</span>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {displayAgents.slice(0, 8).map((agent, index) => {
              const isPlaceholder = !agent.name;
              const rarity = !isPlaceholder ? getRarity(agent.traits) : null;
              const topTraits = !isPlaceholder ? getTopTraits(agent.traits) : [];
              const circleColor = CIRCLE_COLORS[index % 2];

              return (
                <motion.div key={agent.id} className="rounded-xl p-4 sm:p-6 flex flex-col items-center"
                  style={{ backgroundColor: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }}
                  variants={staggerItem} whileHover={!isPlaceholder ? { borderColor: "var(--color-primary)", y: -4 } : {}}>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4" style={{ background: circleColor }} />
                  {isPlaceholder ? (
                    <>
                      <div className="h-3 w-24 rounded mb-2" style={{ backgroundColor: "var(--color-bg-secondary)" }} />
                      <div className="h-2 w-20 rounded" style={{ backgroundColor: "var(--color-bg-secondary)" }} />
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold text-sm sm:text-base mb-1 text-center" style={{ color: "var(--color-text-primary)" }}>{agent.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3 h-3" style={{ color: rarity?.color }} />
                        <span className="text-xs font-medium" style={{ color: rarity?.color }}>{rarity?.label}</span>
                      </div>
                      <p className="text-xs text-center mb-2" style={{ color: "var(--color-text-muted)" }}>{topTraits.join(" • ")}</p>
                      <p className="text-lg font-bold gradient-text">{agent.fitness.toFixed(1)}</p>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default AgentsCatalogue;
