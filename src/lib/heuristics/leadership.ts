// src/lib/heuristics/leadership.ts
// Base: 0, Score by frequency

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
    "authority", "power", "guide", "steer", "boss"
  ]
};

function countOccurrences(text: string, keyword: string): number {
  const regex = new RegExp(keyword, "gi");
  return (text.match(regex) || []).length;
}

export function analyzeLeadership(files: AgentFiles): TraitAnalysis {
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

  // Bonus: has defined mission
  if (content.includes("misión") || content.includes("mission") || content.includes("purpose")) {
    score += 10;
    signals.push("defined mission");
  }

  score = Math.min(100, Math.max(0, score));

  return {
    trait: "leadership",
    score: Math.round(score),
    confidence: signals.length > 3 ? 0.8 : signals.length > 1 ? 0.6 : 0.4,
    signals: signals.slice(0, 8)
  };
}
