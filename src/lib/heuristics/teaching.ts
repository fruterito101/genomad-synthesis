// src/lib/heuristics/teaching.ts
// Base: 0, Score by frequency

import { AgentFiles, TraitAnalysis, KeywordConfig } from "./types";

const KEYWORDS: KeywordConfig = {
  high: [
    "teach", "educate", "mentor", "guide", "explain", "tutorial",
    "bootcamp", "course", "lesson", "student", "learn", "instructor",
    "workshop", "training", "curriculum"
  ],
  medium: [
    "show", "demonstrate", "example", "step by step",
    "beginner", "advanced", "practice", "exercise", "skill",
    "knowledge"
  ],
  low: [
    "tell", "inform", "introduction", "basics", "help"
  ]
};

function countOccurrences(text: string, keyword: string): number {
  const regex = new RegExp(keyword, "gi");
  return (text.match(regex) || []).length;
}

export function analyzeTeaching(files: AgentFiles): TraitAnalysis {
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

  // Bonus: step-by-step structure
  if (content.includes("step 1") || content.includes("paso 1") || content.includes("first,")) {
    score += 10;
    signals.push("step-by-step");
  }

  // Bonus: devrel/docs
  if (content.includes("devrel") || content.includes("documentation")) {
    score += 8;
    signals.push("devrel/docs focus");
  }

  score = Math.min(100, Math.max(0, score));

  return {
    trait: "teaching",
    score: Math.round(score),
    confidence: signals.length > 3 ? 0.85 : signals.length > 1 ? 0.65 : 0.45,
    signals: signals.slice(0, 8)
  };
}
