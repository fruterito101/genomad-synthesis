// src/lib/heuristics/trading.ts
// Base: 0, Score by frequency

import { AgentFiles, TraitAnalysis, KeywordConfig } from "./types";

const KEYWORDS: KeywordConfig = {
  high: [
    "trading", "market", "investment", "portfolio", "defi",
    "yield", "profit", "arbitrage", "liquidity", "swap",
    "leverage", "hedge", "alpha", "whale", "token"
  ],
  medium: [
    "buy", "sell", "price", "crypto", "finance", "money",
    "asset", "risk", "return", "stake", "farm", "mint",
    "position", "exchange"
  ],
  low: [
    "value", "cost", "worth", "earn", "wallet", "transaction"
  ]
};

function countOccurrences(text: string, keyword: string): number {
  const regex = new RegExp(keyword, "gi");
  return (text.match(regex) || []).length;
}

export function analyzeTrading(files: AgentFiles): TraitAnalysis {
  const content = `${files.soul} ${files.identity} ${files.tools}`.toLowerCase();
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

  // Bonus: specific protocols
  const protocols = ["uniswap", "aave", "compound", "curve", "opensea", "nad.fun"];
  const found = protocols.filter(p => content.includes(p));
  if (found.length > 0) {
    score += found.length * 5;
    signals.push(`protocols: ${found.join(", ")}`);
  }

  score = Math.min(100, Math.max(0, score));

  return {
    trait: "trading",
    score: Math.round(score),
    confidence: signals.length > 3 ? 0.85 : signals.length > 1 ? 0.6 : 0.4,
    signals: signals.slice(0, 8)
  };
}
