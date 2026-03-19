// src/components/landing/AgentsCatalogue.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent, Badge, Button, Avatar, AvatarFallback } from "@/components/ui";
import { Star, ArrowRight, Dna } from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

const sampleAgents = [
  { name: "AlphaBot", fitness: 87.5, gen: 3, rarity: "Epic", color: "#A855F7", traits: { technical: 92, creativity: 78 } },
  { name: "BetaAI", fitness: 82.1, gen: 2, rarity: "Rare", color: "#3B82F6", traits: { social: 88, empathy: 85 } },
  { name: "GammaAgent", fitness: 79.3, gen: 1, rarity: "Uncommon", color: "#10B981", traits: { trading: 90, analysis: 82 } },
  { name: "DeltaBot", fitness: 91.2, gen: 4, rarity: "Legendary", color: "#FBBF24", traits: { leadership: 95, teaching: 88 } },
];

export function AgentsCatalogue() {
  const { i18n } = useTranslation();

  return (
    <section id="catalogue" className="py-16 sm:py-24 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4">
            {i18n.language === "es" ? "Catálogo" : "Catalogue"}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {i18n.language === "es" ? "Agentes " : ""}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {i18n.language === "es" ? "Destacados" : "Featured Agents"}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {i18n.language === "es" 
              ? "Explora los agentes más destacados de la plataforma. Cada uno tiene traits únicos."
              : "Explore the top agents on the platform. Each one has unique traits."}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {sampleAgents.map((agent, index) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:border-primary/50 transition-all cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback 
                        className="text-white font-semibold"
                        style={{ background: `linear-gradient(135deg, ${agent.color}, hsl(var(--primary)))` }}
                      >
                        {agent.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{agent.name}</h4>
                      <p className="text-xs text-muted-foreground">Gen {agent.gen}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" style={{ borderColor: agent.color, color: agent.color }}>
                      <Star className="w-3 h-3 mr-1" fill={agent.color} />
                      {agent.rarity}
                    </Badge>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {agent.fitness}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {Object.entries(agent.traits).map(([trait, value]) => (
                      <span key={trait} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground capitalize">
                        {trait}: {value}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Button size="lg" variant="outline" href="/agents">
            <Dna className="w-4 h-4 mr-2" />
            {i18n.language === "es" ? "Ver Todos los Agentes" : "View All Agents"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

export default AgentsCatalogue;
