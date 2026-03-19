// src/components/onboarding/WelcomeModal.tsx
// Welcome modal for first-time users

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Dna, Sparkles, Wallet, Bot, Zap, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button-shadcn";
import { cn } from "@/lib/utils";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOnboarding: () => void;
}

const STORAGE_KEY = "genomad_welcomed";

export function WelcomeModal({ isOpen, onClose, onStartOnboarding }: WelcomeModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Dna,
      title: "Bienvenido a Genomad",
      description: "El primer protocolo de breeding de agentes AI on-chain. Crea, evoluciona y comercia agentes únicos.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Bot,
      title: "Agentes con DNA Único",
      description: "Cada agente tiene 8 traits genéticos que definen su personalidad. Estos traits se heredan y mutan en cada generación.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Sparkles,
      title: "Breeding & Evolución",
      description: "Cruza tus agentes con otros para crear nuevas generaciones. Los hijos heredan traits de ambos padres.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Zap,
      title: "On-Chain en Monad",
      description: "Tus agentes viven como NFTs en Monad blockchain. Datos verificables, propiedad real.",
      color: "from-orange-500 to-yellow-500",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleStart();
    }
  };

  const handleStart = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    onStartOnboarding();
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    onClose();
  };

  if (!isOpen) return null;

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-card rounded-2xl overflow-hidden shadow-2xl border border-border"
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="p-8">
            {/* Icon */}
            <motion.div
              key={currentSlide}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={cn(
                "w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-br",
                slides[currentSlide].color
              )}
            >
              <CurrentIcon className="h-10 w-10 text-white" />
            </motion.div>

            {/* Text */}
            <motion.div
              key={}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold mb-3">{slides[currentSlide].title}</h2>
              <p className="text-muted-foreground">{slides[currentSlide].description}</p>
            </motion.div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mb-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentSlide
                      ? "w-8 bg-primary"
                      : "bg-muted hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleSkip} className="flex-1">
                Saltar
              </Button>
              <Button onClick={handleNext} className="flex-1 gap-2">
                {currentSlide === slides.length - 1 ? (
                  <>
                    Comenzar <Check className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Siguiente <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Hook to manage welcome modal state
 */
export function useWelcomeModal() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const welcomed = localStorage.getItem(STORAGE_KEY);
    if (!welcomed) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowWelcome(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeWelcome = () => setShowWelcome(false);
  const resetWelcome = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowWelcome(true);
  };

  return { showWelcome, closeWelcome, resetWelcome };
}

export default WelcomeModal;
