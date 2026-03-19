// src/lib/heuristics/engine.ts

import { Traits } from "@/lib/genetic/types";
import { 
  AgentFiles, 
  HeuristicsResult, 
  TraitAnalysis, 
  ValidationResult 
} from "./types";
import { analyzeTechnical } from "./technical";
import { analyzeCreativity } from "./creativity";
import { analyzeSocial } from "./social";
import { analyzeAnalysis } from "./analysis";
import { analyzeEmpathy } from "./empathy";
import { analyzeTrading } from "./trading";
import { analyzeTeaching } from "./teaching";
import { analyzeLeadership } from "./leadership";

/**
 * Motor de heurísticas para analizar agentes OpenClaw
 */
export class HeuristicsEngine {
  
  /**
   * Valida que los archivos tienen contenido suficiente
   */
  validateFiles(files: AgentFiles): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!files.soul) {
      errors.push("SOUL.md is missing");
    } else if (files.soul.length < 100) {
      errors.push("SOUL.md is too short (min 100 chars)");
    } else if (files.soul.length < 300) {
      warnings.push("SOUL.md is short, analysis may be less accurate");
    }

    if (!files.identity) {
      errors.push("IDENTITY.md is missing");
    } else if (files.identity.length < 50) {
      errors.push("IDENTITY.md is too short (min 50 chars)");
    }

    if (!files.tools) {
      warnings.push("TOOLS.md is missing, technical analysis may be limited");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Analiza archivos de agente y extrae traits
   */
  analyze(files: AgentFiles): HeuristicsResult {
    // Validar primero
    const validation = this.validateFiles(files);
    
    // Ejecutar todos los analyzers
    const analyses: TraitAnalysis[] = [
      analyzeTechnical(files),
      analyzeCreativity(files),
      analyzeSocial(files),
      analyzeAnalysis(files),
      analyzeEmpathy(files),
      analyzeTrading(files),
      analyzeTeaching(files),
      analyzeLeadership(files),
    ];

    // Construir objeto de traits
    const traits: Traits = {
      technical: this.findScore(analyses, "technical"),
      creativity: this.findScore(analyses, "creativity"),
      social: this.findScore(analyses, "social"),
      analysis: this.findScore(analyses, "analysis"),
      empathy: this.findScore(analyses, "empathy"),
      trading: this.findScore(analyses, "trading"),
      teaching: this.findScore(analyses, "teaching"),
      leadership: this.findScore(analyses, "leadership"),
    };

    // Calcular confianza promedio
    const totalConfidence = 
      analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;

    return {
      traits,
      analysis: analyses,
      totalConfidence: Number(totalConfidence.toFixed(2)),
      warnings: validation.warnings
    };
  }

  /**
   * Analiza y retorna solo los traits (sin metadata)
   */
  extractTraits(files: AgentFiles): Traits {
    return this.analyze(files).traits;
  }

  /**
   * Compara traits antes y después de un cambio
   */
  compareTraits(before: Traits, after: Traits): Array<{
    trait: keyof Traits;
    before: number;
    after: number;
    delta: number;
  }> {
    const changes: Array<{
      trait: keyof Traits;
      before: number;
      after: number;
      delta: number;
    }> = [];

    const traitKeys: (keyof Traits)[] = [
      "technical", "creativity", "social", "analysis",
      "empathy", "trading", "teaching", "leadership"
    ];

    for (const trait of traitKeys) {
      const delta = after[trait] - before[trait];
      if (delta !== 0) {
        changes.push({
          trait,
          before: before[trait],
          after: after[trait],
          delta
        });
      }
    }

    return changes.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  }

  /**
   * Helper para encontrar score de un trait
   */
  private findScore(analyses: TraitAnalysis[], trait: keyof Traits): number {
    return analyses.find(a => a.trait === trait)?.score ?? 50;
  }
}

// Singleton para uso fácil
export const heuristicsEngine = new HeuristicsEngine();
