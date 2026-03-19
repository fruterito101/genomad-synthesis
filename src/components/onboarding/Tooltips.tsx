// src/components/onboarding/Tooltips.tsx
// Contextual tooltips for onboarding

"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TooltipStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

const TOOLTIP_STORAGE_KEY = "genomad_tooltips_seen";

// Predefined tooltip tours
export const DASHBOARD_TOOLTIPS: TooltipStep[] = [
  {
    id: "stats",
    target: "[data-tooltip='stats']",
    title: "Estadísticas",
    content: "Aquí ves el resumen de tus agentes y actividad en la plataforma.",
    position: "bottom",
  },
  {
    id: "agents",
    target: "[data-tooltip='agents']",
    title: "Tus Agentes",
    content: "Lista de todos tus agentes AI. Haz click en uno para ver detalles.",
    position: "top",
  },
  {
    id: "breeding",
    target: "[data-tooltip='breeding']",
    title: "Breeding",
    content: "Cruza tus agentes con otros para crear nuevas generaciones!",
    position: "left",
  },
];

export const AGENT_CARD_TOOLTIPS: TooltipStep[] = [
  {
    id: "traits",
    target: "[data-tooltip='traits']",
    title: "Traits Genéticos",
    content: "Cada agente tiene 8 traits únicos que definen su personalidad.",
    position: "top",
  },
  {
    id: "fitness",
    target: "[data-tooltip='fitness']",
    title: "Fitness Score",
    content: "La suma de todos los traits. Mayor fitness = agente más valioso.",
    position: "left",
  },
];

interface TooltipProps {
  children: ReactNode;
  content: string;
  title?: string;
  position?: "top" | "bottom" | "left" | "right";
  showOnce?: boolean;
  id?: string;
}

export function Tooltip({
  children,
  content,
  title,
  position = "top",
  showOnce = false,
  id,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);

  useEffect(() => {
    if (showOnce && id) {
      const seen = localStorage.getItem(TOOLTIP_STORAGE_KEY);
      const seenIds = seen ? JSON.parse(seen) : [];
      setHasBeenSeen(seenIds.includes(id));
    }
  }, [showOnce, id]);

  const handleMouseEnter = () => {
    if (!hasBeenSeen) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    if (showOnce && id) {
      const seen = localStorage.getItem(TOOLTIP_STORAGE_KEY);
      const seenIds = seen ? JSON.parse(seen) : [];
      if (!seenIds.includes(id)) {
        seenIds.push(id);
        localStorage.setItem(TOOLTIP_STORAGE_KEY, JSON.stringify(seenIds));
        setHasBeenSeen(true);
      }
    }
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-card",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-card",
    left: "left-full top-1/2 -translate-y-1/2 border-l-card",
    right: "right-full top-1/2 -translate-y-1/2 border-r-card",
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "absolute z-50 w-64 p-3 rounded-lg bg-card border shadow-lg",
              positionClasses[position]
            )}
          >
            {title && (
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-sm">{title}</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">{content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Guided Tour Component
 */
interface GuidedTourProps {
  steps: TooltipStep[];
  onComplete: () => void;
  isActive: boolean;
}

export function GuidedTour({ steps, onComplete, isActive }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const target = document.querySelector(steps[currentStep]?.target);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("ring-2", "ring-primary", "ring-offset-2");
    }

    return () => {
      if (target) {
        target.classList.remove("ring-2", "ring-primary", "ring-offset-2");
      }
    };
  }, [currentStep, steps, isActive]);

  if (!isActive || !steps[currentStep]) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto"
      >
        <div className="bg-card rounded-lg border shadow-xl p-4 max-w-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">{step.title}</span>
            </div>
            <button onClick={onComplete} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">{step.content}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} / {steps.length}
            </span>
            <button
              onClick={() => isLast ? onComplete() : setCurrentStep(currentStep + 1)}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {isLast ? "Finalizar" : "Siguiente"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Reset all seen tooltips (for testing)
 */
export function resetTooltips() {
  localStorage.removeItem(TOOLTIP_STORAGE_KEY);
}

export default Tooltip;
