#!/usr/bin/env npx tsx
/**
 * 🧬 GENOMAD CLI - Run Chain Agent
 * 
 * CLI para ejecutar un agente con capacidades on-chain.
 * Integra con el skill genomad para operaciones blockchain.
 * 
 * Usage:
 *   npx tsx cli/run-chain-agent.ts status
 *   npx tsx cli/run-chain-agent.ts register [code]
 *   npx tsx cli/run-chain-agent.ts approve <requestId>
 *   npx tsx cli/run-chain-agent.ts reject <requestId>
 *   npx tsx cli/run-chain-agent.ts sync
 *   npx tsx cli/run-chain-agent.ts pending
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

// ═══════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════

const SKILL_PATHS = [
  join(process.env.HOME || "", ".openclaw/workspace/skills/genomad"),
  join(process.env.HOME || "", "clawd/skills/genomad"),
  join(__dirname, "..", "node_modules", "genomad-skill"),
];

function findSkillPath(): string | null {
  for (const p of SKILL_PATHS) {
    if (existsSync(join(p, "scripts"))) {
      return p;
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════════

const COMMANDS: Record<string, { script: string; description: string; args?: string }> = {
  status: {
    script: "status.ts",
    description: "Ver estado on-chain del agente",
  },
  register: {
    script: "register.ts",
    description: "Registrar agente (opcional: código de vinculación)",
    args: "[code]",
  },
  approve: {
    script: "approve-breeding.ts",
    description: "Aprobar breeding request",
    args: "<requestId>",
  },
  reject: {
    script: "reject-breeding.ts",
    description: "Rechazar breeding request",
    args: "<requestId>",
  },
  sync: {
    script: "sync-identity.ts",
    description: "Sincronizar SOUL/IDENTITY a Monad",
  },
  pending: {
    script: "check-pending.ts",
    description: "Ver breeding requests pendientes",
  },
  custody: {
    script: "check-custody.ts",
    description: "Verificar custody del agente",
  },
  read: {
    script: "read-self.ts",
    description: "Leer SOUL/IDENTITY encriptados on-chain",
  },
};

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

function printHelp() {
  console.log("🧬 Genomad Chain Agent CLI\n");
  console.log("Usage: genomad <command> [args]\n");
  console.log("Commands:");
  for (const [cmd, info] of Object.entries(COMMANDS)) {
    const args = info.args ? " " + info.args : "";
    console.log("  " + (cmd + args).padEnd(25) + info.description);
  }
  console.log("\nExamples:");
  console.log("  genomad status              # Ver estado");
  console.log("  genomad register ABC123     # Registrar con código");
  console.log("  genomad approve 42          # Aprobar breeding #42");
  console.log("  genomad sync                # Sincronizar a Monad");
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    process.exit(0);
  }

  const cmdInfo = COMMANDS[command];
  if (!cmdInfo) {
    console.error("❌ Comando desconocido: " + command);
    console.error("   Usa 'genomad --help' para ver comandos disponibles");
    process.exit(1);
  }

  const skillPath = findSkillPath();
  if (!skillPath) {
    console.error("❌ Skill genomad no encontrado");
    console.error("   Instala con: clawhub install fruterito101/genomad-skill");
    process.exit(1);
  }

  const scriptPath = join(skillPath, "scripts", cmdInfo.script);
  if (!existsSync(scriptPath)) {
    console.error("❌ Script no encontrado: " + cmdInfo.script);
    process.exit(1);
  }

  // Build command with remaining args
  const scriptArgs = args.slice(1).join(" ");
  const fullCommand = "npx tsx \"" + scriptPath + "\" " + scriptArgs;

  try {
    execSync(fullCommand, { stdio: "inherit" });
  } catch (err: any) {
    process.exit(err.status || 1);
  }
}

main();
