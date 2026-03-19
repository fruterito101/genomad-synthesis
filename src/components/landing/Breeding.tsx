// src/components/landing/Breeding.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Dna, Plus, ArrowRight, Sparkles, Crown, Activity, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Breeding() {
  const { i18n } = useTranslation();

  const crossoverTypes = [
    { 
      icon: Crown, 
      name: "Weighted",
      desc: i18n.language === "es" ? "Traits dominantes prevalecen" : "Dominant traits prevail",
      color: "text-yellow-500"
    },
    { 
      icon: Activity, 
      name: "Uniform",
      desc: i18n.language === "es" ? "División 50/50 equilibrada" : "Balanced 50/50 split",
      color: "text-primary"
    },
    { 
      icon: Zap, 
      name: "Single-Point",
      desc: i18n.language === "es" ? "Corte aleatorio del DNA" : "Random DNA cut point",
      color: "text-accent"
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-4">
              {/* Parent A */}
              <Card className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 mx-auto mb-3 flex items-center justify-center">
                  <Dna className="w-8 h-8 text-white" />
                </div>
                <p className="font-semibold">Parent A</p>
                <Badge variant="outline" className="mt-2">85.4 Fitness</Badge>
              </Card>

              {/* Plus */}
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>

              {/* Parent B */}
              <Card className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-emerald-600 mx-auto mb-3 flex items-center justify-center">
                  <Dna className="w-8 h-8 text-white" />
                </div>
                <p className="font-semibold">Parent B</p>
                <Badge variant="outline" className="mt-2">78.2 Fitness</Badge>
              </Card>
            </div>

            {/* Arrow */}
            <div className="flex justify-center my-6">
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-8 h-8 text-primary rotate-90" />
              </motion.div>
            </div>

            {/* Child */}
            <Card className="p-6 text-center max-w-xs mx-auto border-primary/50">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-accent to-secondary mx-auto mb-3 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <p className="font-semibold text-lg">New Agent</p>
              <Badge className="mt-2 bg-primary">88.1 Fitness ↑</Badge>
              <p className="text-xs text-muted-foreground mt-2">Gen 2 • Traits heredados</p>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">
              {i18n.language === "es" ? "Sistema Genético" : "Genetic System"}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {i18n.language === "es" ? "Breeding de " : ""}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {i18n.language === "es" ? "Agentes" : "Agent Breeding"}
              </span>
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              {i18n.language === "es" 
                ? "Combina dos agentes para crear uno nuevo con traits heredados. El fitness puede mejorar o empeorar dependiendo de la genética."
                : "Combine two agents to create a new one with inherited traits. Fitness can improve or worsen depending on genetics."}
            </p>

            <h4 className="font-semibold mb-4">{i18n.language === "es" ? "Tipos de Crossover" : "Crossover Types"}</h4>
            <div className="space-y-3 mb-6">
              {crossoverTypes.map((type) => (
                <div key={type.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${type.color}`}>
                    <type.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{type.name}</p>
                    <p className="text-sm text-muted-foreground">{type.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" href="/breeding">
              {i18n.language === "es" ? "Ir a Breeding" : "Go to Breeding"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Breeding;
