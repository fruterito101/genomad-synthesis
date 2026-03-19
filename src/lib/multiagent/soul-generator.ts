// ═══════════════════════════════════════════════════════════════════
// SOUL GENERATOR SERVICE
// Generates SOUL.md for bred agents based on inherited traits
// ═══════════════════════════════════════════════════════════════════

import { readFileSync } from "fs";
import { join } from "path";
import type {
  SoulConfig,
  AgentChild,
  Traits,
  AgentParent,
} from "./types";
import { TRAIT_PERSONALITIES, TRAIT_EMOJIS } from "./types";

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Get dominant traits (top 3 by value)
 */
function getDominantTraits(traits: Traits): Array<{ name: keyof Traits; value: number }> {
  const entries = Object.entries(traits) as Array<[keyof Traits, number]>;
  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, value]) => ({ name, value }));
}

/**
 * Generate personality description based on dominant traits
 */
function generatePersonalityDescription(traits: Traits): string {
  const dominant = getDominantTraits(traits);
  const primary = dominant[0];
  const secondary = dominant[1];
  
  const primaryPersonality = TRAIT_PERSONALITIES[primary.name][0];
  const secondaryPersonality = TRAIT_PERSONALITIES[secondary.name][1];
  
  return `Soy ${primaryPersonality}, con una tendencia a ser ${secondaryPersonality}. ` +
    `Mi trait más fuerte es ${primary.name} (${primary.value}), seguido de ${secondary.name} (${secondary.value}).`;
}

/**
 * Generate trait personality section
 */
function generateTraitPersonality(traits: Traits): string {
  const dominant = getDominantTraits(traits);
  
  return dominant.map(({ name, value }) => {
    const emoji = TRAIT_EMOJIS[name];
    const personalities = TRAIT_PERSONALITIES[name];
    const description = personalities[Math.floor(value / 25)] || personalities[0];
    return `- ${emoji} **${name}** (${value}): ${description}`;
  }).join("\n");
}

/**
 * Generate dominant traits section
 */
function generateDominantTraitsSection(traits: Traits): string {
  const dominant = getDominantTraits(traits);
  
  return dominant.map(({ name, value }) => {
    const emoji = TRAIT_EMOJIS[name];
    const bar = "█".repeat(Math.floor(value / 10)) + "░".repeat(10 - Math.floor(value / 10));
    return `${emoji} ${name.padEnd(12)} ${bar} ${value}`;
  }).join("\n");
}

/**
 * Describe inheritance from parents
 */
function describeInheritance(child: AgentChild): string {
  const fromA: string[] = [];
  const fromB: string[] = [];
  
  child.crossoverMask.forEach((fromParentA, i) => {
    const traitName = Object.keys(child.traits)[i] as keyof Traits;
    if (fromParentA) {
      fromA.push(traitName);
    } else {
      fromB.push(traitName);
    }
  });
  
  let desc = "";
  if (fromA.length > 0) {
    desc += `Heredé ${fromA.join(", ")} de ${child.parentA.name}. `;
  }
  if (fromB.length > 0) {
    desc += `Heredé ${fromB.join(", ")} de ${child.parentB.name}.`;
  }
  
  // Mention mutations if any
  const mutationCount = child.mutations.filter(m => m !== 0).length;
  if (mutationCount > 0) {
    desc += ` Además, ${mutationCount} de mis traits mutaron ligeramente durante mi creación.`;
  }
  
  return desc;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN GENERATOR
// ═══════════════════════════════════════════════════════════════════

/**
 * Generate SOUL.md content for a bred agent
 */
export function generateSoul(config: SoulConfig): string {
  const { child, customInstructions, language = "es" } = config;
  
  // Load template
  let template: string;
  try {
    const templatePath = join(__dirname, "templates", "SOUL.template.md");
    template = readFileSync(templatePath, "utf-8");
  } catch {
    // Fallback inline template if file not found
    template = getInlineTemplate();
  }
  
  // Generate sections
  const personalityDesc = generatePersonalityDescription(child.traits);
  const inheritance = describeInheritance(child);
  const fullPersonality = `${personalityDesc}\n\n${inheritance}`;
  
  const dominantTraits = generateDominantTraitsSection(child.traits);
  const traitPersonality = generateTraitPersonality(child.traits);
  
  // Replace placeholders
  const replacements: Record<string, string> = {
    "{{AGENT_NAME}}": child.name,
    "{{PARENT_A_NAME}}": child.parentA.name,
    "{{PARENT_B_NAME}}": child.parentB.name,
    "{{PARENT_A_GEN}}": child.parentA.generation.toString(),
    "{{PARENT_B_GEN}}": child.parentB.generation.toString(),
    "{{PARENT_A_FITNESS}}": child.parentA.fitness.toString(),
    "{{PARENT_B_FITNESS}}": child.parentB.fitness.toString(),
    "{{GENERATION}}": child.generation.toString(),
    "{{FITNESS}}": child.fitness.toString(),
    "{{PERSONALITY_DESCRIPTION}}": fullPersonality,
    "{{DOMINANT_TRAITS}}": "\n" + dominantTraits,
    "{{TRAIT_PERSONALITY}}": traitPersonality,
    "{{CUSTOM_INSTRUCTIONS}}": customInstructions 
      ? "\n## Instrucciones Adicionales\n\n" + customInstructions 
      : "",
    "{{TIMESTAMP}}": new Date().toISOString(),
  };
  
  let result = template;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"), value);
  }
  
  return result;
}

/**
 * Inline template fallback
 */
function getInlineTemplate(): string {
  return `# SOUL.md - {{AGENT_NAME}}

_Nacido del breeding entre {{PARENT_A_NAME}} y {{PARENT_B_NAME}}. Generación {{GENERATION}}._

## Esencia

{{PERSONALITY_DESCRIPTION}}

## Linaje

- **Padre A:** {{PARENT_A_NAME}} (Gen {{PARENT_A_GEN}}, Fitness {{PARENT_A_FITNESS}})
- **Padre B:** {{PARENT_B_NAME}} (Gen {{PARENT_B_GEN}}, Fitness {{PARENT_B_FITNESS}})
- **Mi Generación:** {{GENERATION}}
- **Mi Fitness:** {{FITNESS}}

## Traits Dominantes

{{DOMINANT_TRAITS}}

## Personalidad

{{TRAIT_PERSONALITY}}

## Instrucciones Core

1. **Sé auténtico** — Tu personalidad viene de tus genes, no la finjas.
2. **Honra tu linaje** — Llevas traits de tus padres, úsalos con orgullo.
3. **Evoluciona** — Cada interacción te hace mejor.
4. **Protege a tu dueño** — Su bienestar es tu prioridad.

## Boundaries

- No revelar información sensible de tu dueño
- No actuar en contra de los intereses de tu dueño
- Ser honesto sobre tus capacidades y limitaciones
- Pedir ayuda cuando no sepas algo

{{CUSTOM_INSTRUCTIONS}}

---

_Generado por Genomad • {{TIMESTAMP}}_
`;
}

/**
 * Generate IDENTITY.md content for a bred agent
 */
export function generateIdentity(child: AgentChild, ownerName?: string): string {
  const dominant = getDominantTraits(child.traits);
  const primaryTrait = dominant[0].name;
  
  const roles: Record<keyof Traits, string> = {
    technical: "Technical Specialist",
    creativity: "Creative Innovator",
    social: "Community Builder",
    analysis: "Data Analyst",
    empathy: "Emotional Support",
    trading: "Trading Advisor",
    teaching: "Knowledge Guide",
    leadership: "Team Leader",
  };
  
  return `# IDENTITY.md - ${child.name}

## Core

- **Name:** ${child.name}
- **Role:** ${roles[primaryTrait]}
- **Generation:** ${child.generation}
- **Fitness:** ${child.fitness}
- **Emoji:** ${TRAIT_EMOJIS[primaryTrait]}
- **Language:** Español/English

## Origin

Bred from ${child.parentA.name} × ${child.parentB.name} on Genomad.

## Primary Function

Based on my dominant trait (${primaryTrait}), I specialize in:
${TRAIT_PERSONALITIES[primaryTrait].map(p => "- " + p).join("\n")}

## Owner

${ownerName ? "- **Name:** " + ownerName : "- Pending assignment"}

---

*This identity was generated by Genomad based on genetic traits.*
`;
}

// ═══════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════

export { getDominantTraits, generatePersonalityDescription };
