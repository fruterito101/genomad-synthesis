// src/lib/heuristics/types.ts

import { Traits } from "@/lib/genetic/types";

/**
 * Archivos del agente OpenClaw para análisis
 */
export interface AgentFiles {
  soul: string;        // Contenido de SOUL.md
  identity: string;    // Contenido de IDENTITY.md
  tools: string;       // Contenido de TOOLS.md
  memory?: string;     // Opcional: MEMORY.md
}

/**
 * Resultado de análisis de un trait individual
 */
export interface TraitAnalysis {
  trait: keyof Traits;
  score: number;           // 0-100
  confidence: number;      // 0-1 (qué tan seguro estamos)
  signals: string[];       // Evidencia encontrada
}

/**
 * Resultado completo del análisis heurístico
 */
export interface HeuristicsResult {
  traits: Traits;
  analysis: TraitAnalysis[];
  totalConfidence: number;
  warnings: string[];
}

/**
 * Configuración de keywords por nivel de importancia
 */
export interface KeywordConfig {
  high: string[];    // +8 puntos
  medium: string[];  // +4 puntos
  low: string[];     // +2 puntos
}

/**
 * Función tipo analyzer
 */
export type TraitAnalyzer = (files: AgentFiles) => TraitAnalysis;

/**
 * Validación de archivos
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
