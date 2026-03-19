// src/app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LoginButton } from "@/components/LoginButton";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui";
import { 
  Dna, 
  Sparkles, 
  Users, 
  TrendingUp,
  ArrowRight,
  Zap,
  Shield,
  Crown,
  Activity
} from "lucide-react";

const features = [
  {
    icon: Dna,
    title: "DNA Único",
    description: "8 traits que definen la personalidad de tu agente",
    color: "var(--color-primary)",
  },
  {
    icon: Sparkles,
    title: "Evolución",
    description: "Mejora generación tras generación",
    color: "var(--color-secondary)",
  },
  {
    icon: Users,
    title: "Breeding",
    description: "Combina agentes para crear nuevas especies",
    color: "var(--color-accent-1)",
  },
  {
    icon: TrendingUp,
    title: "Rentabilidad",
    description: "Gana $GMD rentando tus agentes",
    color: "#F59E0B",
  },
];

const stats = [
  { label: "Agentes Activos", value: "2", icon: Activity },
  { label: "Generaciones", value: "0", icon: Crown },
  { label: "Breedings", value: "0", icon: Dna },
];

export default function DashboardPage() {
  const { authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      // Optionally redirect to profile if already logged in
    }
  }, [ready, authenticated]);

  if (!ready) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-bg-primary)" }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Dna className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse" style={{ color: "var(--color-primary)" }} />
          <p style={{ color: "var(--color-text-secondary)" }}>Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!authenticated) {
    return (
      <div 
        className="min-h-screen"
        style={{ backgroundColor: "var(--color-bg-primary)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 md:py-20">
          {/* Hero */}
          <motion.div
            className="text-center mb-10 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: "var(--color-primary)" }} />
              <span className="text-xs sm:text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Built on Monad
              </span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-2">
              <span style={{ color: "var(--color-text-primary)" }}>
                Evoluciona tu{" "}
              </span>
              <span className="gradient-text">Agente AI</span>
            </h1>

            <p 
              className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 px-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              El primer protocolo de breeding de agentes AI on-chain. 
              Crea, evoluciona y comercia agentes únicos con DNA verificable.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <LoginButton />
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12 md:mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="p-5 sm:p-6 rounded-xl card-hover"
                  style={{
                    backgroundColor: "var(--color-bg-secondary)",
                    border: "1px solid var(--color-border)",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{
                    borderColor: feature.color,
                    boxShadow: `0 0 30px ${feature.color}20`,
                  }}
                >
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 
                    className="text-base sm:text-lg font-bold mb-1 sm:mb-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Security Badge */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 p-4 rounded-xl mx-auto max-w-md"
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Shield className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--color-secondary)" }} />
            <span className="text-sm text-center" style={{ color: "var(--color-text-secondary)" }}>
              DNA encriptado on-chain • Solo tú controlas tu agente
            </span>
          </motion.div>
        </div>
      </div>
    );
  }

  // Authenticated - show dashboard
  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-8 sm:pb-12">
        {/* Welcome */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 
            className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Bienvenido a <span className="gradient-text">Genomad</span>
          </h1>
          <p className="text-sm sm:text-base" style={{ color: "var(--color-text-secondary)" }}>
            Tu centro de control para agentes AI evolutivos
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="p-4 sm:p-6 rounded-xl"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p 
                      className="text-xs sm:text-sm mb-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {stat.label}
                    </p>
                    <p 
                      className="text-2xl sm:text-3xl font-bold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(123, 63, 228, 0.1)" }}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--color-primary)" }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Link Agent */}
          <motion.div
            className="p-5 sm:p-6 rounded-xl gradient-border"
            style={{ backgroundColor: "var(--color-bg-secondary)" }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, var(--color-secondary), var(--color-primary))" }}
              >
                <Dna className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 
                  className="text-lg sm:text-xl font-bold mb-1 sm:mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Vincula tu Agente
                </h3>
                <p 
                  className="text-sm mb-3 sm:mb-4"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Conecta tu agente OpenClaw y extrae su DNA único
                </p>
                <Button variant="primary" size="sm" href="/profile">
                  Ir a Profile
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Start Breeding */}
          <motion.div
            className="p-5 sm:p-6 rounded-xl"
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
            }}
            whileHover={{ 
              y: -4,
              borderColor: "var(--color-accent-1)",
            }}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, var(--color-accent-1), var(--color-primary))" }}
              >
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 
                  className="text-lg sm:text-xl font-bold mb-1 sm:mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Inicia Breeding
                </h3>
                <p 
                  className="text-sm mb-3 sm:mb-4"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Combina agentes para crear una nueva generación
                </p>
                <Button variant="secondary" size="sm" href="/breeding">
                  Explorar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Genesis Agents Preview */}
        <motion.div
          className="mt-6 sm:mt-8 p-5 sm:p-6 rounded-xl"
          style={{
            backgroundColor: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
            <h3 
              className="text-lg sm:text-xl font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Genesis Agents
            </h3>
            <span 
              className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "rgba(123, 63, 228, 0.1)",
                color: "var(--color-primary)",
              }}
            >
              Generation 0
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Tiamat */}
            <div
              className="p-4 rounded-lg flex items-center gap-3 sm:gap-4"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}
              >
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm sm:text-base" style={{ color: "var(--color-text-primary)" }}>
                  Tiamat
                </h4>
                <p className="text-xs sm:text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Fitness: 98.4 • Legendary
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-bold gradient-text">98.4</span>
              </div>
            </div>

            {/* Apsu */}
            <div
              className="p-4 rounded-lg flex items-center gap-3 sm:gap-4"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #06B6D4, #8B5CF6)" }}
              >
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm sm:text-base" style={{ color: "var(--color-text-primary)" }}>
                  Apsu
                </h4>
                <p className="text-xs sm:text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Fitness: 95.6 • Epic
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-bold gradient-text">95.6</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
