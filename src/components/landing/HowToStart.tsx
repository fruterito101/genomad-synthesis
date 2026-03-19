// src/components/landing/HowToStart.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Wallet, Link2, Dna, TrendingUp, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export function HowToStart() {
  const { i18n } = useTranslation();

  const steps = [
    { 
      icon: Wallet, 
      title: i18n.language === "es" ? "Conecta Wallet" : "Connect Wallet",
      desc: i18n.language === "es" ? "Usa Privy para conectar tu wallet" : "Use Privy to connect your wallet",
      num: "01"
    },
    { 
      icon: Link2, 
      title: i18n.language === "es" ? "Vincula Agente" : "Link Agent",
      desc: i18n.language === "es" ? "Genera un código y vincula tu bot" : "Generate a code and link your bot",
      num: "02"
    },
    { 
      icon: Dna, 
      title: i18n.language === "es" ? "Haz Breeding" : "Start Breeding",
      desc: i18n.language === "es" ? "Combina agentes para crear nuevos" : "Combine agents to create new ones",
      num: "03"
    },
    { 
      icon: TrendingUp, 
      title: i18n.language === "es" ? "Evoluciona" : "Evolve",
      desc: i18n.language === "es" ? "Mejora el fitness cada generación" : "Improve fitness each generation",
      num: "04"
    },
  ];

  return (
    <section id="guides" className="py-16 sm:py-24 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4">
            {i18n.language === "es" ? "Guía Rápida" : "Quick Guide"}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {i18n.language === "es" ? "¿Cómo " : "How to "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {i18n.language === "es" ? "Empezar" : "Get Started"}
            </span>
            ?
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full relative overflow-hidden group hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <span className="absolute top-4 right-4 text-4xl font-bold text-muted-foreground/20 group-hover:text-primary/20 transition-colors">
                    {step.num}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
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
          <Button size="lg" href="/dashboard">
            {i18n.language === "es" ? "Comenzar Ahora" : "Start Now"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

export default HowToStart;
