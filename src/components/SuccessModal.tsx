// src/components/SuccessModal.tsx
// Modal de celebración cuando se crea un agente

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Dna, Crown, PartyPopper, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import Link from "next/link";

interface ChildAgent {
  id: string;
  name: string;
  traits?: Record<string, number>;
  fitness?: number;
  generation?: number;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: ChildAgent | null;
  breeding?: {
    parentAFitness?: number;
    parentBFitness?: number;
    childFitness?: number;
    improved?: boolean;
    mutationsApplied?: number;
  };
}

export function SuccessModal({ isOpen, onClose, child, breeding }: SuccessModalProps) {
  if (!child) return null;

  const fitnessImproved = breeding?.improved;
  const traitKeys = child.traits ? Object.keys(child.traits).filter(k => k !== "skillCount") : [];
  const topTraits = traitKeys
    .sort((a, b) => (child.traits![b] || 0) - (child.traits![a] || 0))
    .slice(0, 3);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md rounded-2xl overflow-hidden"
              style={{ backgroundColor: "var(--color-bg-secondary)" }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Confetti background effect */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: ["#f97316", "#8B5CF6", "#EC4899", "#10B981", "#3B82F6"][i % 5],
                      left: `${Math.random() * 100}%`,
                      top: -10,
                    }}
                    animate={{
                      y: [0, 500],
                      x: [0, (Math.random() - 0.5) * 100],
                      rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                      opacity: [1, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      delay: Math.random() * 0.5,
                      repeat: Infinity,
                      repeatDelay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full transition-colors"
                style={{ color: "var(--color-text-muted)" }}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="relative p-6 sm:p-8 text-center">
                {/* Icon */}
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <PartyPopper className="w-10 h-10 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  className="text-2xl sm:text-3xl font-bold mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  ¡Felicidades!
                </motion.h2>

                <motion.p
                  className="text-sm sm:text-base mb-6"
                  style={{ color: "var(--color-text-secondary)" }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Tu nuevo agente ha nacido
                </motion.p>

                {/* Agent Card */}
                <motion.div
                  className="rounded-xl p-4 sm:p-6 mb-6"
                  style={{ backgroundColor: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, var(--color-primary), #EC4899)" }}
                    >
                      <Dna className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>
                        {child.name}
                      </h3>
                      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                        Gen {child.generation || 1}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                        {(child.fitness || breeding?.childFitness || 0).toFixed(1)}
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Fitness</p>
                    </div>
                  </div>

                  {/* Top traits */}
                  {topTraits.length > 0 && (
                    <div className="flex gap-2 flex-wrap justify-center">
                      {topTraits.map((trait) => (
                        <span
                          key={trait}
                          className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                          style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-secondary)" }}
                        >
                          {trait}: {child.traits![trait]}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Improved badge */}
                  {fitnessImproved && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" style={{ color: "#10B981" }} />
                      <span className="text-sm font-medium" style={{ color: "#10B981" }}>
                        ¡Fitness mejorado vs padres!
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* Actions */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button variant="secondary" className="flex-1" onClick={onClose}>
                    Seguir criando
                  </Button>
                  <Link href="/profile" className="flex-1">
                    <Button variant="primary" className="w-full">
                      Ver en Perfil <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
