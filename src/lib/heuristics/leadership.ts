// src/lib/heuristics/leadership.ts

import { AgentFiles, TraitAnalysis, KeywordConfig } from "./types";

const KEYWORDS: KeywordConfig = {
  high: [
    "lead", "leadership", "manage", "direct", "vision", "strategy",
    "decision", "responsibility", "initiative", "influence",
    "founder", "ceo", "director", "head"
  ],
  medium: [
    "organize", "coordinate", "delegate", "inspire", "motivate",
    "mission", "goal", "objective", "plan", "execute",
    "accountable", "ownership"
  ],
  low: [
    "in charge", "boss", "authority", "power",
    "guide", "steer"
  ]
};

export function analyzeLeadership(files: AgentFiles): TraitAnalysis {
  const content = `${files.soul} ${files.identity}`.toLowerCase();
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

  // Bonus: tiene misión clara definida
  if (content.includes("misión") || content.includes("mission") || content.includes("purpose")) {
    score += 8;
    signals.push("[bonus] has defined mission");
  }

  // Bonus: toma decisiones
  if (content.includes("decide") || content.includes("choice") || content.includes("judgment")) {
    score += 5;
    signals.push("[bonus] decision-making");
  }

  score = Math.min(100, Math.max(0, score));

  return {
    trait: "leadership",
    score: Math.round(score),
    confidence: signals.length > 3 ? 0.8 : signals.length > 1 ? 0.6 : 0.4,
    signals: signals.slice(0, 8)
  };
}
