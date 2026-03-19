// src/components/landing/AgentsCatalogue.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui";
import { useTranslation } from "react-i18next";
import { ArrowRight, Star, Dna } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

interface Agent {
  id: string;
  name: string;
  traits: Record<string, number>;
  fitness: number;
  generation: number;
  isActive: boolean;
}

// Colores alternados como en el diseño original
const CIRCLE_COLORS = [
  "linear-gradient(135deg, #C026FF, #7B3FE4)", // Morado/magenta
  "linear-gradient(135deg, #00AA93, #7B3FE4)", // Turquesa
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

export function AgentsCatalogue() {
  const { i18n } = useTranslation();
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

  // Si hay menos de 8 agentes, rellenar con placeholders
  const displayAgents = [...agents];
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
    <section
      id="catalogue"
      className="py-16 sm:py-20 md:py-24"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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

        {/* Main Container */}
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
          {/* Filter Bar - Same style */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-3">
              <div 
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: "var(--color-bg-tertiary)" }}
              >
                <span style={{ color: "var(--color-text-secondary)" }}>
                  {i18n.language === "es" ? "Buscar" : "Search"}
                </span>
              </div>
              <div 
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: "var(--color-bg-tertiary)" }}
              >
                <span style={{ color: "var(--color-text-secondary)" }}>
                  {i18n.language === "es" ? "Filtrar" : "Filter"}
                </span>
              </div>
            </div>
            <Link href="/agents">
              <div 
                className="px-6 py-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                <span className="text-white font-medium">
                  {i18n.language === "es" ? "Ver Todos" : "View All"}
                </span>
              </div>
            </Link>
          </div>

          {/* Agents Grid - 4x2 layout */}
          {loading ? (
            <div className="text-center py-12">
              <Dna className="w-12 h-12 mx-auto animate-pulse" style={{ color: "var(--color-primary)" }} />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {displayAgents.slice(0, 8).map((agent, index) => {
                const isPlaceholder = !agent.name;
                const rarity = !isPlaceholder ? getRarity(agent.traits) : null;
                const topTraits = !isPlaceholder ? getTopTraits(agent.traits) : [];
                const circleColor = CIRCLE_COLORS[index % 2];

                return (
                  <motion.div
                    key={agent.id}
                    className="rounded-xl p-4 sm:p-6 flex flex-col items-center"
                    style={{
                      backgroundColor: "var(--color-bg-tertiary)",
                      border: "1px solid var(--color-border)",
                    }}
                    variants={staggerItem}
                    whileHover={!isPlaceholder ? { borderColor: "var(--color-primary)", y: -4 } : {}}
                  >
                    {/* Circle Avatar */}
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4"
                      style={{ background: circleColor }}
                    />

                    {/* Content */}
                    {isPlaceholder ? (
                      <>
                        {/* Placeholder bars */}
                        <div 
                          className="h-3 w-24 rounded mb-2"
                          style={{ backgroundColor: "var(--color-bg-secondary)" }}
                        />
                        <div 
                          className="h-2 w-20 rounded"
                          style={{ backgroundColor: "var(--color-bg-secondary)" }}
                        />
                      </>
                    ) : (
                      <>
                        {/* Agent Name */}
                        <h3 
                          className="font-bold text-sm sm:text-base mb-1 text-center"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {agent.name}
                        </h3>

                        {/* Rarity */}
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3 h-3" style={{ color: rarity?.color }} />
                          <span 
                            className="text-xs font-medium"
                            style={{ color: rarity?.color }}
                          >
                            {rarity?.label}
                          </span>
                        </div>

                        {/* Top Traits */}
                        <p 
                          className="text-xs text-center mb-2"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {topTraits.join(" • ")}
                        </p>

                        {/* Fitness */}
                        <p 
                          className="text-lg font-bold gradient-text"
                        >
                          {agent.fitness.toFixed(1)}
                        </p>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Link href="/agents">
            <Button variant="primary" size="lg" className="w-full sm:w-auto px-12">
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
