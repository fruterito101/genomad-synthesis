// src/lib/heuristics/technical.ts

import { AgentFiles, TraitAnalysis, KeywordConfig } from "./types";

const KEYWORDS: KeywordConfig = {
  high: [
    "typescript", "solidity", "rust", "python", "javascript",
    "smart contract", "api", "backend", "frontend", "deploy",
    "github", "docker", "kubernetes", "aws", "database",
    "algorithm", "architecture", "framework", "sdk", "cli"
  ],
  medium: [
    "code", "programming", "developer", "engineer", "build",
    "npm", "git", "server", "debug", "test", "compile",
    "function", "class", "module", "library", "package"
  ],
  low: [
    "tech", "software", "app", "website", "computer",
    "system", "tool", "script", "command"
  ]
};

export function analyzeTechnical(files: AgentFiles): TraitAnalysis {
  const content = `${files.soul} ${files.identity} ${files.tools}`.toLowerCase();
  const signals: string[] = [];
  let score = 50; // Base score

  // Buscar keywords de alto impacto
  for (const kw of KEYWORDS.high) {
    if (content.includes(kw)) {
      score += 8;
      signals.push(`[high] ${kw}`);
    }
  }

  // Keywords de medio impacto
  for (const kw of KEYWORDS.medium) {
    if (content.includes(kw)) {
      score += 4;
      if (signals.length < 10) signals.push(`[med] ${kw}`);
    }
  }

  // Keywords de bajo impacto
  for (const kw of KEYWORDS.low) {
    if (content.includes(kw)) {
      score += 2;
    }
  }

  // Bonus: tiene bloques de código
  const codeBlocks = (content.match(/```/g) || []).length / 2;
  if (codeBlocks > 0) {
    score += Math.min(15, codeBlocks * 5);
    signals.push(`[bonus] ${codeBlocks} code blocks`);
  }

  // Bonus: menciona herramientas específicas en TOOLS.md
  if (files.tools.length > 200) {
    score += 5;
    signals.push("[bonus] detailed TOOLS.md");
  }

  // Clamp score
  score = Math.min(100, Math.max(0, score));

  return {
    trait: "technical",
    score: Math.round(score),
    confidence: signals.length > 5 ? 0.9 : signals.length > 2 ? 0.7 : 0.5,
    signals: signals.slice(0, 8)
  };
}
