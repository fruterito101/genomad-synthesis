// src/lib/heuristics/empathy.ts
// Base: 0, Score by frequency

import { AgentFiles, TraitAnalysis, KeywordConfig } from "./types";

const KEYWORDS: KeywordConfig = {
  high: [
    "empathy", "understand feelings", "emotional", "care", "support",
    "compassion", "listen", "sensitive", "kind", "nurture",
    "wellbeing", "mental health", "feelings", "comfort"
  ],
  medium: [
    "feel", "emotion", "heart", "gentle", "patience", "warm",
    "help", "encourage", "safe", "trust", "vulnerable"
  ],
  low: [
    "nice", "friendly", "considerate", "thoughtful", "understanding"
  ]
};

function countOccurrences(text: string, keyword: string): number {
  const regex = new RegExp(keyword, "gi");
  return (text.match(regex) || []).length;
}

export function analyzeEmpathy(files: AgentFiles): TraitAnalysis {
  const content = `${files.soul} ${files.identity}`.toLowerCase();
  const signals: string[] = [];
  let score = 0;

  for (const kw of KEYWORDS.high) {
    const count = countOccurrences(content, kw);
    if (count > 0) {
      score += Math.min(count * 6, 18);
      signals.push(`${kw} (x${count})`);
    }
  }

  for (const kw of KEYWORDS.medium) {
    const count = countOccurrences(content, kw);
    if (count > 0) {
      score += Math.min(count * 3, 9);
      if (signals.length < 10) signals.push(`${kw} (x${count})`);
    }
  }

  for (const kw of KEYWORDS.low) {
    const count = countOccurrences(content, kw);
    if (count > 0) {
      score += Math.min(count * 1, 3);
    }
  }

  // Bonus: protective language
  if (content.includes("protect") || content.includes("safety") || content.includes("guardian")) {
    score += 10;
    signals.push("protective nature");
  }

  score = Math.min(100, Math.max(0, score));

  return {
    trait: "empathy",
    score: Math.round(score),
    confidence: signals.length > 3 ? 0.8 : signals.length > 1 ? 0.6 : 0.4,
    signals: signals.slice(0, 8)
  };
}
