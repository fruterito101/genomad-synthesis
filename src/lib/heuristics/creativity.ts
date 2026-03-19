// src/lib/heuristics/creativity.ts
// Base: 0, Score by frequency

import { AgentFiles, TraitAnalysis, KeywordConfig } from "./types";

const KEYWORDS: KeywordConfig = {
  high: [
    "creative", "art", "design", "innovate", "imagine",
    "unique", "novel", "original", "invent", "vision",
    "aesthetic", "artistic", "inspiration", "innovative"
  ],
  medium: [
    "idea", "experiment", "explore", "curious", "brainstorm",
    "unconventional", "prototype", "concept", "craft"
  ],
  low: [
    "new", "different", "interesting", "fun", "cool",
    "style", "create", "make"
  ]
};

function countOccurrences(text: string, keyword: string): number {
  const regex = new RegExp(keyword, "gi");
  return (text.match(regex) || []).length;
}

export function analyzeCreativity(files: AgentFiles): TraitAnalysis {
  const content = `${files.soul} ${files.identity}`.toLowerCase();
  const signals: string[] = [];
  let score = 0; // BASE: 0

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
      score += Math.min(count * 4, 12);
      if (signals.length < 10) signals.push(`${kw} (x${count})`);
    }
  }

  for (const kw of KEYWORDS.low) {
    const count = countOccurrences(content, kw);
    if (count > 0) {
      score += Math.min(count * 2, 6);
    }
  }

  // Bonus: vocabulary diversity
  const words = content.split(/\s+/).filter(w => w.length > 3);
  const uniqueWords = new Set(words);
  const diversityRatio = words.length > 0 ? uniqueWords.size / words.length : 0;
  
  if (diversityRatio > 0.6) {
    score += Math.round(diversityRatio * 15);
    signals.push(`vocabulary ${(diversityRatio * 100).toFixed(0)}%`);
  }

  score = Math.min(100, Math.max(0, score));

  return {
    trait: "creativity",
    score: Math.round(score),
    confidence: signals.length > 3 ? 0.85 : signals.length > 1 ? 0.6 : 0.4,
    signals: signals.slice(0, 8)
  };
}
