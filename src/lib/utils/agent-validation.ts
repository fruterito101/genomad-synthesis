/**
 * 🛡️ Agent Validation Utilities
 * 
 * Funciones para validar y sanitizar datos de agentes
 * antes de renderizar en el frontend
 */

// Tipos
export interface AgentTraits {
  technical: number;
  creativity: number;
  social: number;
  analysis: number;
  empathy: number;
  trading: number;
  teaching: number;
  leadership: number;
  skillCount?: number;
}

export interface Agent {
  id: string;
  name: string;
  traits: AgentTraits | Record<string, number> | null | undefined;
  fitness: number | null | undefined;
  generation: number;
  isActive?: boolean;
  isSuspicious?: boolean;
  botUsername?: string | null;
  owner?: { wallet?: string | null; name?: string | null } | null;
}

// Defaults seguros
export const DEFAULT_TRAITS: AgentTraits = {
  technical: 50,
  creativity: 50,
  social: 50,
  analysis: 50,
  empathy: 50,
  trading: 50,
  teaching: 50,
  leadership: 50,
  skillCount: 0,
};

export const TRAIT_NAMES = [
  'technical', 'creativity', 'social', 'analysis',
  'empathy', 'trading', 'teaching', 'leadership'
] as const;

/**
 * Verifica si un agente tiene datos válidos para renderizar
 */
export function isValidAgent(agent: unknown): agent is Agent {
  if (!agent || typeof agent !== 'object') return false;
  
  const a = agent as Partial<Agent>;
  
  // ID y nombre son requeridos
  if (!a.id || typeof a.id !== 'string') return false;
  if (!a.name || typeof a.name !== 'string') return false;
  
  return true;
}

/**
 * Verifica si un agente debe mostrarse (no sospechoso, datos válidos)
 */
export function shouldShowAgent(agent: unknown): boolean {
  if (!isValidAgent(agent)) return false;
  
  // No mostrar agentes sospechosos
  if (agent.isSuspicious === true) return false;
  
  return true;
}

/**
 * Obtiene traits de forma segura, siempre retorna valores válidos
 */
export function safeTraits(traits: unknown): AgentTraits {
  if (!traits || typeof traits !== 'object') {
    return { ...DEFAULT_TRAITS };
  }
  
  const t = traits as Record<string, unknown>;
  const result: AgentTraits = { ...DEFAULT_TRAITS };
  
  for (const name of TRAIT_NAMES) {
    const value = t[name];
    if (typeof value === 'number' && !isNaN(value) && value >= 0 && value <= 100) {
      result[name] = Math.round(value);
    }
  }
  
  // SkillCount
  if (typeof t.skillCount === 'number' && !isNaN(t.skillCount)) {
    result.skillCount = Math.max(0, Math.round(t.skillCount));
  }
  
  return result;
}

/**
 * Obtiene un valor de trait de forma segura
 */
export function safeTrait(traits: unknown, name: keyof AgentTraits): number {
  const safe = safeTraits(traits);
  return safe[name] ?? 50;
}

/**
 * Obtiene fitness de forma segura
 */
export function safeFitness(fitness: unknown): number {
  if (typeof fitness === 'number' && !isNaN(fitness) && fitness >= 0 && fitness <= 100) {
    return Math.round(fitness * 10) / 10;
  }
  return 50;
}

/**
 * Obtiene nombre de forma segura
 */
export function safeName(name: unknown): string {
  if (typeof name === 'string' && name.trim().length > 0) {
    return name.trim().slice(0, 50);
  }
  return 'Unknown Agent';
}

/**
 * Sanitiza un agente completo para renderizado seguro
 */
export function sanitizeAgent(agent: unknown): Agent | null {
  if (!isValidAgent(agent)) return null;
  if (agent.isSuspicious) return null;
  
  return {
    id: agent.id,
    name: safeName(agent.name),
    traits: safeTraits(agent.traits),
    fitness: safeFitness(agent.fitness),
    generation: typeof agent.generation === 'number' ? agent.generation : 0,
    isActive: agent.isActive ?? false,
    isSuspicious: false,
    botUsername: typeof agent.botUsername === 'string' ? agent.botUsername : null,
    owner: agent.owner ?? null,
  };
}

/**
 * Filtra y sanitiza una lista de agentes
 */
export function sanitizeAgentList(agents: unknown[]): Agent[] {
  if (!Array.isArray(agents)) return [];
  
  return agents
    .map(a => sanitizeAgent(a))
    .filter((a): a is Agent => a !== null);
}

/**
 * Calcula rareza de forma segura
 */
export function safeRarity(traits: unknown): { 
  label: string; 
  color: string; 
  bg: string;
} {
  const safe = safeTraits(traits);
  const values = TRAIT_NAMES.map(n => safe[n]);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  
  // Ceiling de 92, así que ajustamos los rangos
  if (avg >= 78) return { label: 'Épico', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' };
  if (avg >= 65 || max >= 85) return { label: 'Raro', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' };
  if (avg >= 45) return { label: 'Poco Común', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
  return { label: 'Común', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.15)' };
}

/**
 * Obtiene los top N traits de forma segura
 */
export function safeTopTraits(traits: unknown, count = 2): Array<{ key: string; value: number }> {
  const safe = safeTraits(traits);
  
  return TRAIT_NAMES
    .map(key => ({ key, value: safe[key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, count);
}
