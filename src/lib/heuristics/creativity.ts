// src/lib/heuristics/creativity.ts

import { AgentFiles, TraitAnalysis, KeywordConfig } from "./types";

const KEYWORDS: KeywordConfig = {
  high: [
    "creative", "art", "design", "innovate", "imagine",
    "unique", "novel", "original", "invent", "vision",
    "aesthetic", "artistic", "inspiration", "innovative"
  ],
  medium: [
    "idea", "experiment", "explore", "curious", "brainstorm",
    "unconventional", "different approach", "think outside",
    "prototype", "concept", "craft"
  ],
  low: [
    "new", "different", "interesting", "fun", "cool",
    "style", "create", "make"
  ]
};

export function analyzeCreativity(files: AgentFiles): TraitAnalysis {
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

  // Bonus: vocabulario diverso (unique words ratio)
  const words = content.split(/\s+/).filter(w => w.length > 3);
  const uniqueWords = new Set(words);
  const diversityRatio = words.length > 0 ? uniqueWords.size / words.length : 0;
  
  if (diversityRatio > 0.7) {
    score += 10;
    signals.push(`[bonus] high vocabulary diversity (${(diversityRatio * 100).toFixed(0)}%)`);
  } else if (diversityRatio > 0.5) {
    score += 5;
  }

  // Bonus: usa emojis (expresividad)
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  const emojiCount = (content.match(emojiRegex) || []).length;
  if (emojiCount > 5) {
    score += 5;
    signals.push(`[bonus] uses ${emojiCount} emojis`);
  }

  score = Math.min(100, Math.max(0, score));

  return {
    trait: "creativity",
    score: Math.round(score),
    confidence: signals.length > 3 ? 0.85 : signals.length > 1 ? 0.6 : 0.4,
    signals: signals.slice(0, 8)
  };
}
