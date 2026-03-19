// src/lib/heuristics/empathy.ts

import { AgentFiles, TraitAnalysis, KeywordConfig } from "./types";

const KEYWORDS: KeywordConfig = {
  high: [
    "empathy", "understand feelings", "emotional", "care", "support",
    "compassion", "listen", "sensitive", "kind", "nurture",
    "wellbeing", "mental health", "feelings", "comfort"
  ],
  medium: [
    "feel", "emotion", "heart", "gentle", "patience", "warm",
    "help", "encourage", "safe space", "trust", "vulnerable"
  ],
  low: [
    "nice", "friendly", "considerate", "thoughtful",
    "understanding", "supportive"
  ]
};

export function analyzeEmpathy(files: AgentFiles): TraitAnalysis {
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

  // Bonus: menciona proteger/cuidar al usuario
  if (content.includes("protect") || content.includes("safety") || content.includes("guardian")) {
    score += 8;
    signals.push("[bonus] protective nature");
  }

  score = Math.min(100, Math.max(0, score));

  return {
    trait: "empathy",
    score: Math.round(score),
    confidence: signals.length > 3 ? 0.8 : signals.length > 1 ? 0.6 : 0.4,
    signals: signals.slice(0, 8)
  };
}
