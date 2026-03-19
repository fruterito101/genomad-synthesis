// ═══════════════════════════════════════════════════════════════════
// MULTI-AGENT SYSTEM - TYPES
// ═══════════════════════════════════════════════════════════════════

export interface Traits {
  technical: number;
  creativity: number;
  social: number;
  analysis: number;
  empathy: number;
  trading: number;
  teaching: number;
  leadership: number;
}

export interface AgentParent {
  id: string;
  name: string;
  traits: Traits;
  fitness: number;
  generation: number;
}

export interface AgentChild {
  id: string;
  name: string;
  traits: Traits;
  fitness: number;
  generation: number;
  parentA: AgentParent;
  parentB: AgentParent;
  crossoverMask: boolean[];
  mutations: number[];
}

export interface SoulConfig {
  child: AgentChild;
  customInstructions?: string;
  language?: "es" | "en";
}

export interface WorkspaceConfig {
  agentId: string;
  agentName: string;
  soul: string;
  identity: string;
  ownerName?: string;
  ownerTelegram?: string;
}

export interface OpenClawAgentConfig {
  id: string;
  name: string;
  workspace: string;
  model?: string;
  bindings?: AgentBinding[];
}

export interface AgentBinding {
  channel: string;
  type: string;
  config: Record<string, unknown>;
}

export interface ActivationResult {
  success: boolean;
  agentId: string;
  workspacePath?: string;
  error?: string;
  steps: ActivationStep[];
}

export interface ActivationStep {
  name: string;
  status: "pending" | "running" | "success" | "failed";
  message?: string;
  duration?: number;
}

// Trait personality mappings
export const TRAIT_PERSONALITIES: Record<keyof Traits, string[]> = {
  technical: [
    "metódico y preciso",
    "orientado a soluciones técnicas",
    "analiza problemas sistemáticamente",
    "prefiere datos sobre opiniones",
  ],
  creativity: [
    "imaginativo e innovador",
    "piensa fuera de la caja",
    "genera ideas únicas",
    "conecta conceptos inesperados",
  ],
  social: [
    "comunicativo y amigable",
    "disfruta la interacción",
    "construye conexiones fácilmente",
    "entiende dinámicas sociales",
  ],
  analysis: [
    "analítico y observador",
    "descompone problemas complejos",
    "identifica patrones",
    "evalúa opciones objetivamente",
  ],
  empathy: [
    "empático y comprensivo",
    "sintoniza con emociones ajenas",
    "ofrece apoyo emocional",
    "escucha activamente",
  ],
  trading: [
    "estratégico con recursos",
    "identifica oportunidades",
    "maneja riesgo calculado",
    "entiende mercados y valor",
  ],
  teaching: [
    "paciente al explicar",
    "adapta explicaciones al nivel",
    "usa ejemplos claros",
    "verifica comprensión",
  ],
  leadership: [
    "toma iniciativa",
    "inspira a otros",
    "toma decisiones difíciles",
    "asume responsabilidad",
  ],
};

export const TRAIT_EMOJIS: Record<keyof Traits, string> = {
  technical: "💻",
  creativity: "🎨",
  social: "🤝",
  analysis: "📊",
  empathy: "💜",
  trading: "📈",
  teaching: "📚",
  leadership: "👑",
};
