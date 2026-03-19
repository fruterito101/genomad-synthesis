// src/components/landing/Hero.tsx
"use client";

import { motion } from "framer-motion";
import { Button, Card, Badge } from "@/components/ui";
import { Check, Sparkles, Dna } from "lucide-react";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";

// Dynamic import para SSR safety
const DNAScene = dynamic(
  () => import("@/components/three/DNAScene").then((mod) => mod.DNAScene),
  { ssr: false, loading: () => <div className="w-full h-full bg-card/50 animate-pulse" /> }
);

export function Hero() {
  const { t, i18n } = useTranslation();

  const features = [
    t("hero.features.0"),
    t("hero.features.1"),
    t("hero.features.2"),
    t("hero.features.3"),
    t("hero.features.4"),
  ];

  return (
    <section className="min-h-screen flex items-center justify-center pt-20 sm:pt-24 pb-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            {/* Beta Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-4"
            >
              <Badge variant="outline" className="border-primary text-primary">
                <Sparkles className="w-3 h-3 mr-1" />
                {i18n.language === "es" ? "Beta en Monad Testnet" : "Beta on Monad Testnet"}
              </Badge>
            </motion.div>

            {/* Tagline */}
            <motion.h1 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="text-foreground">{t("hero.title")}</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                {t("hero.titleHighlight")}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t("hero.subtitle")}
            </motion.p>

            {/* Features List */}
            <motion.ul 
              className="space-y-2 sm:space-y-3 mb-6 sm:mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <span className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-secondary" />
                  </span>
                  <span className="text-foreground">{feature}</span>
                </motion.li>
              ))}
            </motion.ul>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Button size="lg" href="/dashboard" className="w-full sm:w-auto">
                <Dna className="w-4 h-4 mr-2" />
                {t("header.cta")}
              </Button>
              <Button variant="outline" size="lg" href="#about" className="w-full sm:w-auto">
                {i18n.language === "es" ? "Aprende Más" : "Learn More"}
              </Button>
            </motion.div>
          </motion.div>

          {/* 3D DNA Scene */}
          <motion.div
            className="relative order-1 lg:order-2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="aspect-video overflow-hidden p-0 bg-black/20">
              <DNAScene className="w-full h-full" />
            </Card>

            {/* Floating stats */}
            <motion.div
              className="hidden sm:block absolute -bottom-4 -left-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1 }}
            >
              <Card className="p-4 text-center min-w-[100px] border-primary/50 bg-card/80 backdrop-blur">
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">8</p>
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  {i18n.language === "es" ? "Traits únicos" : "Unique Traits"}
                </p>
              </Card>
            </motion.div>

            <motion.div
              className="hidden sm:block absolute -top-4 -right-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.2 }}
            >
              <Card className="p-4 text-center min-w-[130px] border-secondary/50 bg-card/80 backdrop-blur">
                <p className="text-2xl sm:text-3xl font-bold text-secondary">∞</p>
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  {i18n.language === "es" ? "Combinaciones" : "Combinations"}
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
