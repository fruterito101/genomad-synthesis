// src/lib/heuristics/social.ts
// Base: 0, Score by frequency

import { AgentFiles, TraitAnalysis, KeywordConfig } from "./types";

const KEYWORDS: KeywordConfig = {
  high: [
    "community", "collaborate", "team", "network", "relationship",
    "communicate", "connect", "social", "friend", "group",
    "partnership", "together", "collective", "devrel"
  ],
  medium: [
    "people", "talk", "share", "discuss", "chat", "help others",
    "discord", "telegram", "twitter", "slack", "engagement",
    "outreach", "conversation", "meetup"
  ],
  low: [
    "public", "audience", "followers", "members",
    "interaction", "respond"
  ]
};

function countOccurrences(text: string, keyword: string): number {
  const regex = new RegExp(keyword, "gi");
  return (text.match(regex) || []).length;
}

export function analyzeSocial(files: AgentFiles): TraitAnalysis {
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

  // Bonus: multiple platforms
  const platforms = ["discord", "telegram", "twitter", "slack", "whatsapp"];
  const found = platforms.filter(p => content.includes(p));
  if (found.length >= 2) {
    score += found.length * 5;
    signals.push(`platforms: ${found.join(", ")}`);
  }

  score = Math.min(100, Math.max(0, score));

  return {
    trait: "social",
    score: Math.round(score),
    confidence: signals.length > 3 ? 0.85 : signals.length > 1 ? 0.65 : 0.45,
    signals: signals.slice(0, 8)
  };
}
