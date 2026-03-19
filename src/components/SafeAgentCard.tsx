"use client";

import { memo } from "react";
import { Star, Dna } from "lucide-react";
import { 
  isValidAgent, 
  safeTraits, 
  safeFitness, 
  safeName,
  safeRarity,
  safeTopTraits,
  TRAIT_NAMES,
} from "@/lib/utils/agent-validation";
import { AgentCardError } from "./FallbackUI";

// Configuración de traits
const traitConfig: Record<string, { emoji: string; label: string; color: string }> = {
  technical: { emoji: "💻", label: "Técnico", color: "#3B82F6" },
  creativity: { emoji: "🎨", label: "Creativo", color: "#EC4899" },
  social: { emoji: "🤝", label: "Social", color: "#8B5CF6" },
  analysis: { emoji: "📊", label: "Analítico", color: "#06B6D4" },
  empathy: { emoji: "💜", label: "Empático", color: "#EF4444" },
  trading: { emoji: "📈", label: "Trader", color: "#10B981" },
  teaching: { emoji: "📚", label: "Maestro", color: "#F59E0B" },
  leadership: { emoji: "👑", label: "Líder", color: "#F97316" },
};

interface SafeAgentCardProps {
  agent: unknown;
  onClick?: () => void;
  showDetails?: boolean;
}

/**
 * 🛡️ Safe Agent Card
 * 
 * Renderiza un agente de forma segura, manejando todos los casos de datos inválidos
 */
function SafeAgentCardComponent({ agent, onClick, showDetails = false }: SafeAgentCardProps) {
  // Validar que el agente sea válido
  if (!isValidAgent(agent)) {
    return <AgentCardError agentId={typeof agent === 'object' && agent !== null ? (agent as any).id : undefined} />;
  }
  
  // No mostrar agentes sospechosos
  if (agent.isSuspicious) {
    return null;
  }
  
  // Obtener datos de forma segura
  const name = safeName(agent.name);
  const traits = safeTraits(agent.traits);
  const fitness = safeFitness(agent.fitness);
  const rarity = safeRarity(agent.traits);
  const topTraits = safeTopTraits(agent.traits, 2);
  const generation = typeof agent.generation === 'number' ? agent.generation : 0;
  
  // Generar gradiente basado en top traits
  const gradientColors = topTraits.length >= 2
    ? [traitConfig[topTraits[0].key]?.color || "#7B3FE4", traitConfig[topTraits[1].key]?.color || "#00AA93"]
    : ["#7B3FE4", "#00AA93"];
  
  return (
    <div 
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-purple-500/50 transition cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Avatar con gradiente */}
      <div 
        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-105"
        style={{ 
          background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})` 
        }}
      >
        <Dna className="w-8 h-8 text-white/80" />
      </div>
      
      {/* Nombre */}
      <h3 className="text-center font-semibold text-white mb-1 truncate" title={name}>
        {name}
      </h3>
      
      {/* Rareza */}
      <div className="flex items-center justify-center gap-1 mb-2">
        <Star 
          className="w-3 h-3" 
          style={{ color: rarity.color }}
          fill={rarity.color}
        />
        <span 
          className="text-xs font-medium"
          style={{ color: rarity.color }}
        >
          {rarity.label}
        </span>
      </div>
      
      {/* Top Traits */}
      <p className="text-center text-xs text-gray-400 mb-3">
        {topTraits.map((t, i) => (
          <span key={t.key}>
            {traitConfig[t.key]?.label || t.key}
            {i < topTraits.length - 1 && " • "}
          </span>
        ))}
      </p>
      
      {/* Fitness */}
      <p 
        className="text-center text-lg font-bold"
        style={{ color: rarity.color }}
      >
        {fitness.toFixed(1)}
      </p>
      
      {/* Generación (si showDetails) */}
      {showDetails && (
        <p className="text-center text-xs text-gray-500 mt-2">
          Gen {generation}
        </p>
      )}
      
      {/* Detalles expandidos (si showDetails) */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
          {TRAIT_NAMES.map(traitName => {
            const value = traits[traitName];
            const config = traitConfig[traitName];
            return (
              <div key={traitName} className="flex items-center gap-2">
                <span className="text-xs w-6">{config?.emoji}</span>
                <span className="text-xs text-gray-400 w-16">{config?.label}</span>
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${value}%`,
                      backgroundColor: config?.color || '#7B3FE4',
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{value}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Memo para evitar re-renders innecesarios
export const SafeAgentCard = memo(SafeAgentCardComponent);
