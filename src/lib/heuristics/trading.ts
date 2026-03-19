// src/lib/heuristics/trading.ts

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
    "value", "cost", "worth", "earn", "wallet",
    "transaction", "transfer"
  ]
};

export function analyzeTrading(files: AgentFiles): TraitAnalysis {
  const content = `${files.soul} ${files.identity} ${files.tools}`.toLowerCase();
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

  // Bonus: menciona exchanges/protocolos específicos
  const protocols = ["uniswap", "aave", "compound", "curve", "binance", "coinbase", "opensea"];
  const found = protocols.filter(p => content.includes(p));
  if (found.length > 0) {
    score += found.length * 3;
    signals.push(`[bonus] knows protocols: ${found.join(", ")}`);
  }

  score = Math.min(100, Math.max(0, score));

  return {
    trait: "trading",
    score: Math.round(score),
    confidence: signals.length > 3 ? 0.85 : signals.length > 1 ? 0.6 : 0.4,
    signals: signals.slice(0, 8)
  };
}
