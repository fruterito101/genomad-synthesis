// src/components/SuccessModal.tsx
// Modal de celebración cuando se crea un agente - Migrado a shadcn Dialog

"use client";

import { motion } from "framer-motion";
import { Sparkles, Dna, PartyPopper, ArrowRight } from "lucide-react";
import { 
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui";
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

// Confetti component
function Confetti() {
  return (
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
  );
}

export function SuccessModal({ isOpen, onClose, child, breeding }: SuccessModalProps) {
  if (!child) return null;

  const fitnessImproved = breeding?.improved;
  const traitKeys = child.traits ? Object.keys(child.traits).filter(k => k !== "skillCount") : [];
  const topTraits = traitKeys
    .sort((a, b) => (child.traits![b] || 0) - (child.traits![a] || 0))
    .slice(0, 3);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card overflow-hidden">
        {/* Confetti */}
        <Confetti />

        <div className="relative text-center">
          {/* Icon */}
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <PartyPopper className="w-10 h-10 text-white" />
          </motion.div>

          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="text-2xl sm:text-3xl">
              ¡Felicidades!
            </DialogTitle>
            <DialogDescription>
              Tu nuevo agente ha nacido
            </DialogDescription>
          </DialogHeader>

          {/* Agent Card */}
          <motion.div
            className="rounded-xl p-4 sm:p-6 my-6 bg-muted border border-border"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                <Dna className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-foreground">
                  {child.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Gen {child.generation || 1}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-bold text-primary">
                  {(child.fitness || breeding?.childFitness || 0).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Fitness</p>
              </div>
            </div>

            {/* Top traits */}
            {topTraits.length > 0 && (
              <div className="flex gap-2 flex-wrap justify-center">
                {topTraits.map((trait) => (
                  <span
                    key={trait}
                    className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-background text-muted-foreground"
                  >
                    {trait}: {child.traits![trait]}
                  </span>
                ))}
              </div>
            )}

            {/* Improved badge */}
            {fitnessImproved && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-500">
                  ¡Fitness mejorado vs padres!
                </span>
              </div>
            )}
          </motion.div>

          {/* Actions */}
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Seguir criando
            </Button>
            <Link href="/profile" className="flex-1">
              <Button className="w-full">
                Ver en Perfil <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
