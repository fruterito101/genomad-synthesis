// src/lib/heuristics/social.ts

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

export function analyzeSocial(files: AgentFiles): TraitAnalysis {
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

  // Bonus: menciona múltiples plataformas sociales
  const platforms = ["discord", "telegram", "twitter", "slack", "whatsapp", "signal"];
  const foundPlatforms = platforms.filter(p => content.includes(p));
  if (foundPlatforms.length >= 2) {
    score += 10;
    signals.push(`[bonus] multi-platform: ${foundPlatforms.join(", ")}`);
  }

  score = Math.min(100, Math.max(0, score));

  return {
    trait: "social",
    score: Math.round(score),
    confidence: signals.length > 3 ? 0.85 : signals.length > 1 ? 0.65 : 0.45,
    signals: signals.slice(0, 8)
  };
}
