// src/components/landing/WhatIsGenomad.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent, Badge } from "@/components/ui";
import { Dna, Sparkles, TrendingUp, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export function WhatIsGenomad() {
  const { t, i18n } = useTranslation();

  const features = [
    { 
      icon: Dna, 
      title: i18n.language === "es" ? "DNA Único" : "Unique DNA",
      desc: i18n.language === "es" ? "8 traits genéticos definen la personalidad" : "8 genetic traits define personality",
      color: "text-primary"
    },
    { 
      icon: Sparkles, 
      title: i18n.language === "es" ? "Evolución" : "Evolution",
      desc: i18n.language === "es" ? "Mejora con cada generación" : "Improve with each generation",
      color: "text-accent"
    },
    { 
      icon: TrendingUp, 
      title: i18n.language === "es" ? "Fitness" : "Fitness",
      desc: i18n.language === "es" ? "Mide el rendimiento del agente" : "Measures agent performance",
      color: "text-secondary"
    },
    { 
      icon: Shield, 
      title: i18n.language === "es" ? "On-Chain" : "On-Chain",
      desc: i18n.language === "es" ? "Verificable en Monad blockchain" : "Verifiable on Monad blockchain",
      color: "text-emerald-500"
    },
  ];

  return (
    <section id="about" className="py-16 sm:py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4">
            {i18n.language === "es" ? "El Protocolo" : "The Protocol"}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-foreground">{i18n.language === "es" ? "¿Qué es " : "What is "}</span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Genomad</span>
            <span className="text-foreground">?</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {i18n.language === "es" 
              ? "El primer protocolo de breeding de agentes AI on-chain. Crea, evoluciona y comercia agentes únicos."
              : "The first on-chain AI agent breeding protocol. Create, evolve, and trade unique agents."}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center bg-muted ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhatIsGenomad;
