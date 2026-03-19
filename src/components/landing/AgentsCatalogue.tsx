// src/components/landing/AgentsCatalogue.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui";
import { useTranslation } from "react-i18next";
import { 
  Star, Crown, Cpu, Palette, MessageSquare, Brain, 
  Heart, TrendingUp, GraduationCap, ArrowRight, Dna
} from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

interface Agent {
  id: string;
  name: string;
  traits: Record<string, number>;
  fitness: number;
  generation: number;
  isActive: boolean;
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

function getRarity(traits: Record<string, number>): { label: string; color: string } {
  const values = Object.values(traits).filter(v => typeof v === "number");
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  if (avg >= 80) return { label: "Legendario", color: "#FBBF24" };
  if (avg >= 75 || max >= 95) return { label: "Épico", color: "#A855F7" };
  if (avg >= 60 || max >= 85) return { label: "Raro", color: "#3B82F6" };
  return { label: "Común", color: "#10B981" };
}

function getTopTrait(traits: Record<string, number>): { key: string; value: number } {
  const entries = Object.entries(traits).filter(([k]) => k !== "skillCount");
  const sorted = entries.sort(([, a], [, b]) => (b as number) - (a as number));
  return { key: sorted[0]?.[0] || "technical", value: sorted[0]?.[1] as number || 50 };
}

export function AgentsCatalogue() {
  const { t, i18n } = useTranslation();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch("/api/leaderboard?limit=8");
        if (res.ok) {
          const data = await res.json();
          setAgents(data.agents || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  return (
    <section
      id="catalogue"
      className="py-16 sm:py-20 md:py-24"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10 sm:mb-12"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">
              {i18n.language === "es" ? "Catálogo de Agentes" : "Agent Catalogue"}
            </span>
          </h2>
          <p
            className="text-base sm:text-lg max-w-2xl mx-auto"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {i18n.language === "es" 
              ? "Explora los agentes disponibles para adopción y breeding"
              : "Explore agents available for adoption and breeding"}
          </p>
        </motion.div>

        {/* Agents Grid */}
        <motion.div
          className="rounded-2xl p-4 sm:p-6 md:p-8 mb-8"
          style={{
            backgroundColor: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
          }}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Filters placeholder */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div 
              className="px-4 py-2 rounded-lg text-sm"
              style={{ backgroundColor: "var(--color-bg-tertiary)", color: "var(--color-text-secondary)" }}
            >
              🔍 Buscar
            </div>
            <div 
              className="px-4 py-2 rounded-lg text-sm"
              style={{ backgroundColor: "var(--color-bg-tertiary)", color: "var(--color-text-secondary)" }}
            >
              📋 Filtrar
            </div>
            <div className="ml-auto">
              <Link href="/agents">
                <Button variant="primary" size="sm">
                  Ver Todos
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Dna className="w-12 h-12 mx-auto animate-pulse" style={{ color: "var(--color-primary)" }} />
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--color-text-muted)" }} />
              <p style={{ color: "var(--color-text-secondary)" }}>
                {i18n.language === "es" ? "No hay agentes aún" : "No agents yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {agents.map((agent, index) => {
                const rarity = getRarity(agent.traits);
                const topTrait = getTopTrait(agent.traits);
                const config = traitConfig[topTrait.key];
                const Icon = config?.icon || Star;

                return (
                  <motion.div
                    key={agent.id}
                    className="rounded-xl p-4 text-center"
                    style={{
                      backgroundColor: "var(--color-bg-tertiary)",
                      border: "1px solid var(--color-border)",
                    }}
                    variants={staggerItem}
                    whileHover={{ borderColor: "var(--color-primary)", y: -4 }}
                  >
                    {/* Avatar Circle */}
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-3 flex items-center justify-center relative"
                      style={{
                        background: `linear-gradient(135deg, ${config?.color || "#7B3FE4"}, var(--color-primary))`,
                      }}
                    >
                      <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      {agent.isActive && (
                        <span
                          className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2"
                          style={{ borderColor: "var(--color-bg-tertiary)" }}
                        />
                      )}
                    </div>

                    {/* Name */}
                    <h3
                      className="font-bold text-sm sm:text-base mb-1"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {agent.name}
                    </h3>

                    {/* Rarity */}
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium mb-2"
                      style={{ backgroundColor: `${rarity.color}20`, color: rarity.color }}
                    >
                      <Star className="w-3 h-3" />
                      {rarity.label}
                    </span>

                    {/* Top Traits */}
                    <div className="flex justify-center gap-1 mb-2">
                      {Object.entries(agent.traits)
                        .filter(([k]) => k !== "skillCount")
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 2)
                        .map(([key, value]) => {
                          const tc = traitConfig[key];
                          const TIcon = tc?.icon || Star;
                          return (
                            <span
                              key={key}
                              className="text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5"
                              style={{ backgroundColor: `${tc?.color}15`, color: tc?.color }}
                            >
                              <TIcon className="w-3 h-3" />
                              {value as number}
                            </span>
                          );
                        })}
                    </div>

                    {/* Fitness */}
                    <p className="text-lg font-bold gradient-text">{agent.fitness.toFixed(1)}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Link href="/agents">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              {i18n.language === "es" ? "Ver Catálogo Completo" : "View Full Catalogue"}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default AgentsCatalogue;
