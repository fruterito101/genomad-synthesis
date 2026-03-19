// src/lib/heuristics/analysis.ts
// Base: 0, Score by frequency

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
    "think", "consider", "check", "verify", "detail", "specific"
  ]
};

function countOccurrences(text: string, keyword: string): number {
  const regex = new RegExp(keyword, "gi");
  return (text.match(regex) || []).length;
}

export function analyzeAnalysis(files: AgentFiles): TraitAnalysis {
  const content = `${files.soul} ${files.identity} ${files.tools}`.toLowerCase();
  const signals: string[] = [];
  let score = 0;

  for (const kw of KEYWORDS.high) {
    const count = countOccurrences(content, kw);
    if (count > 0) {
      score += Math.min(count * 5, 15);
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

  // Bonus: structured content
  const bulletCount = (content.match(/^[\-\*]\s/gm) || []).length;
  if (bulletCount > 10) {
    score += Math.min(bulletCount, 15);
    signals.push(`${bulletCount} bullets`);
  }

  score = Math.min(100, Math.max(0, score));

  return {
    trait: "analysis",
    score: Math.round(score),
    confidence: signals.length > 4 ? 0.9 : signals.length > 2 ? 0.7 : 0.5,
    signals: signals.slice(0, 8)
  };
}
