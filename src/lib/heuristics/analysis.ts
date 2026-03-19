// src/lib/heuristics/analysis.ts

import { AgentFiles, TraitAnalysis, KeywordConfig } from "./types";

const KEYWORDS: KeywordConfig = {
  high: [
    "analyze", "data", "research", "logic", "evaluate", "metrics",
    "statistics", "pattern", "insight", "systematic", "objective",
    "methodology", "hypothesis", "evidence", "reasoning"
  ],
  medium: [
    "study", "review", "assess", "examine", "investigate",
    "understand", "reason", "facts", "measure", "compare",
    "structure", "organize", "categorize"
  ],
  low: [
    "think", "consider", "look at", "check", "verify",
    "detail", "specific"
  ]
};

export function analyzeAnalysis(files: AgentFiles): TraitAnalysis {
  const content = `${files.soul} ${files.identity} ${files.tools}`.toLowerCase();
  const signals: string[] = [];
  let score = 50;

  for (const kw of KEYWORDS.high) {
    if (content.includes(kw)) {
      score += 8;
      signals.push(`[high] ${kw}`);
    }
  }

  for (const kw of KEYWORDS.medium) {
    if (content.includes(kw)) {
      score += 4;
      if (signals.length < 10) signals.push(`[med] ${kw}`);
    }
  }

  for (const kw of KEYWORDS.low) {
    if (content.includes(kw)) {
      score += 2;
    }
  }

  // Bonus: contenido estructurado (bullets, números)
  const bulletCount = (content.match(/^[\-\*\d\.]\s/gm) || []).length;
  if (bulletCount > 15) {
    score += 10;
    signals.push(`[bonus] highly structured (${bulletCount} bullets)`);
  } else if (bulletCount > 5) {
    score += 5;
    signals.push(`[bonus] structured content`);
  }

  // Bonus: usa tablas markdown
  if (content.includes("|---") || content.includes("| ---")) {
    score += 5;
    signals.push("[bonus] uses tables");
  }

  score = Math.min(100, Math.max(0, score));

  return {
    trait: "analysis",
    score: Math.round(score),
    confidence: signals.length > 4 ? 0.9 : signals.length > 2 ? 0.7 : 0.5,
    signals: signals.slice(0, 8)
  };
}
