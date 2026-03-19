// src/lib/heuristics/technical.ts
// MEJORADO: Más keywords, base 0, frecuencia

import { AgentFiles, TraitAnalysis } from "./types";

const KEYWORDS = {
  high: [
    // Languages
    "typescript", "javascript", "solidity", "rust", "python", "golang", "java",
    // Frameworks
    "react", "nextjs", "nodejs", "express", "fastapi", "django",
    // Blockchain
    "smart contract", "web3", "ethereum", "monad", "blockchain", "evm", "hardhat", "foundry",
    // DevOps
    "docker", "kubernetes", "aws", "gcp", "azure", "github actions",
    // Databases
    "postgresql", "mongodb", "redis", "sql", "database", "prisma", "drizzle",
    // Tools
    "api", "rest", "graphql", "sdk", "cli", "terminal", "vscode"
  ],
  medium: [
    "code", "coding", "programming", "developer", "engineer", "software",
    "backend", "frontend", "fullstack", "deploy", "deployment", "server",
    "npm", "yarn", "bun", "git", "github", "gitlab", "repository", "repo",
    "debug", "test", "testing", "compile", "build", "architecture",
    "function", "class", "module", "library", "package", "framework",
    "algorithm", "optimization"
  ],
  low: [
    "tech", "technical", "app", "application", "website", "web",
    "computer", "system", "tool", "script", "command", "config"
  ]
};

function countOccurrences(text: string, keyword: string): number {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "gi");
  return (text.match(regex) || []).length;
}

export function analyzeTechnical(files: AgentFiles): TraitAnalysis {
  const content = `${files.soul} ${files.identity} ${files.tools}`.toLowerCase();
  const signals: string[] = [];
  let score = 0;

  for (const kw of KEYWORDS.high) {
    const count = countOccurrences(content, kw);
    if (count > 0) {
      score += Math.min(count * 4, 12);
      signals.push(`${kw} (x${count})`);
    }
  }

  for (const kw of KEYWORDS.medium) {
    const count = countOccurrences(content, kw);
    if (count > 0) {
      score += Math.min(count * 2, 6);
      if (signals.length < 15) signals.push(`${kw} (x${count})`);
    }
  }

  for (const kw of KEYWORDS.low) {
    const count = countOccurrences(content, kw);
    if (count > 0) {
      score += Math.min(count * 1, 3);
    }
  }

  // Bonus: code blocks
  const codeBlocks = (content.match(/```/g) || []).length / 2;
  if (codeBlocks > 0) {
    score += Math.min(Math.floor(codeBlocks) * 2, 8);
    signals.push(`${Math.floor(codeBlocks)} code blocks`);
  }

  score = Math.min(100, Math.max(0, score));

  return {
    trait: "technical",
    score: Math.round(score),
    confidence: signals.length > 8 ? 0.95 : signals.length > 4 ? 0.8 : signals.length > 1 ? 0.6 : 0.3,
    signals: signals.slice(0, 10)
  };
}
