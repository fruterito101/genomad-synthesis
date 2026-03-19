// src/lib/heuristics/teaching.ts

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
    "knowledge", "understand"
  ],
  low: [
    "tell", "inform", "share knowledge", "help learn",
    "introduction", "basics"
  ]
};

export function analyzeTeaching(files: AgentFiles): TraitAnalysis {
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

  // Bonus: tiene estructura didáctica (paso a paso)
  if (content.includes("step 1") || content.includes("paso 1") || content.includes("first,")) {
    score += 8;
    signals.push("[bonus] step-by-step structure");
  }

  // Bonus: menciona DevRel o documentación
  if (content.includes("devrel") || content.includes("documentation") || content.includes("docs")) {
    score += 5;
    signals.push("[bonus] documentation focus");
  }

  score = Math.min(100, Math.max(0, score));

  return {
    trait: "teaching",
    score: Math.round(score),
    confidence: signals.length > 3 ? 0.85 : signals.length > 1 ? 0.65 : 0.45,
    signals: signals.slice(0, 8)
  };
}
