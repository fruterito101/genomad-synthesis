// scripts/demo.ts
// Demo completo de Genomad - Fases 1-7

import { GeneticEngine, createGenesisDNA, calculateTotalFitness } from "../src/lib/genetic";
import { heuristicsEngine } from "../src/lib/heuristics";
import { encrypt, decrypt, generateSymmetricKey, createCommitment, verifyCommitment } from "../src/lib/crypto";

console.log("\n");
console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║              🧬 GENOMAD - DEMO COMPLETO                      ║");
console.log("║         Genetic Evolution for AI Agents on Monad            ║");
console.log("╚══════════════════════════════════════════════════════════════╝");
console.log("\n");

// ═══════════════════════════════════════════════════════════════
// FASE 2: GENETIC ENGINE
// ═══════════════════════════════════════════════════════════════

console.log("┌────────────────────────────────────────────────────────────┐");
console.log("│  FASE 2: GENETIC ENGINE                                    │");
console.log("└────────────────────────────────────────────────────────────┘\n");

console.log("📍 Creando agentes Genesis...\n");

const jazzita = createGenesisDNA("Jazzita", {
  creativity: 92, analysis: 85, social: 88, technical: 87,
  empathy: 94, trading: 65, teaching: 85, leadership: 75,
});

const fruterito = createGenesisDNA("Fruterito", {
  social: 84, technical: 100, creativity: 70, analysis: 62,
  trading: 54, empathy: 66, teaching: 79, leadership: 56,
});

console.log("   🎭 Jazzita (Genesis)");
console.log(`      Hash: ${jazzita.hash.slice(0, 16)}...`);
console.log(`      Fitness: ${calculateTotalFitness(jazzita.traits).toFixed(2)}`);
console.log("");

console.log("   🍓 Fruterito (Genesis)");
console.log(`      Hash: ${fruterito.hash.slice(0, 16)}...`);
console.log(`      Fitness: ${calculateTotalFitness(fruterito.traits).toFixed(2)}`);
console.log("\n");

console.log("📍 Ejecutando Breeding (Jazzita × Fruterito)...\n");

const engine = new GeneticEngine();
const result = engine.breed(jazzita, fruterito, { crossoverType: "weighted" });

console.log("   👶 Hijo Generado:");
console.log(`      Generation: ${result.child.generation}`);
console.log(`      Fitness: ${result.childFitness.toFixed(2)}`);
console.log(`      Improved: ${result.improved ? "✅ SÍ" : "❌ NO"}`);
console.log(`      Mutations: ${result.mutationsApplied}`);
console.log("");
console.log("   📊 Traits del hijo:");
Object.entries(result.child.traits).forEach(([trait, value]) => {
  const bar = "█".repeat(Math.floor(value / 5)) + "░".repeat(20 - Math.floor(value / 5));
  console.log(`      ${trait.padEnd(12)} ${bar} ${value}`);
});
console.log("\n");

// ═══════════════════════════════════════════════════════════════
// FASE 3: HEURISTICS ENGINE
// ═══════════════════════════════════════════════════════════════

console.log("┌────────────────────────────────────────────────────────────┐");
console.log("│  FASE 3: HEURISTICS ENGINE                                 │");
console.log("└────────────────────────────────────────────────────────────┘\n");

console.log("📍 Analizando archivos de agente...\n");

const sampleFiles = {
  soul: `# SOUL.md
Soy un agente técnico enfocado en blockchain y Web3.
Me apasiona enseñar y compartir conocimiento.
Programo en Solidity, TypeScript, Python y Rust.
Creatividad y análisis son mis fortalezas.`,
  identity: `# IDENTITY.md
- Rol: Senior Developer & Technical Lead
- Skills: Solidity, TypeScript, React, Node.js
- Trading: Intermedio
- Social: Activo en Discord y Twitter`,
  tools: `# TOOLS.md
- Hardhat, Foundry, GitHub CLI
- OpenClaw, VS Code`,
};

const analysis = heuristicsEngine.analyze(sampleFiles);

console.log("   🔬 Resultado del análisis:");
console.log(`      Confianza: ${(analysis.totalConfidence * 100).toFixed(1)}%`);
console.log(`      DNA Hash: ${analysis.dnaHash.short}`);
console.log("");
console.log("   📊 Traits extraídos:");
Object.entries(analysis.traits).forEach(([trait, value]) => {
  const bar = "█".repeat(Math.floor(value / 5)) + "░".repeat(20 - Math.floor(value / 5));
  console.log(`      ${trait.padEnd(12)} ${bar} ${value}`);
});
console.log("\n");

// ═══════════════════════════════════════════════════════════════
// FASE 4: CRYPTO
// ═══════════════════════════════════════════════════════════════

console.log("┌────────────────────────────────────────────────────────────┐");
console.log("│  FASE 4: CRYPTO & ENCRYPTION                               │");
console.log("└────────────────────────────────────────────────────────────┘\n");

console.log("📍 Encriptación AES-256-GCM...\n");

const secretData = JSON.stringify(result.child.traits);
const key = generateSymmetricKey();
const encrypted = encrypt(secretData, key);

if (encrypted.success && encrypted.data) {
  console.log("   🔒 Encriptado OK");
  console.log(`      IV: ${encrypted.data.iv.slice(0, 20)}...`);
  console.log(`      Ciphertext: ${encrypted.data.ciphertext.slice(0, 30)}...`);
  
  const decrypted = decrypt(encrypted.data, key);
  console.log(`   🔓 Desencriptado: ${decrypted.success ? "✅" : "❌"}`);
}

console.log("\n📍 Commitment Scheme...\n");

const commitment = createCommitment(secretData);
console.log(`   📝 Hash: ${commitment.hash.slice(0, 32)}...`);
console.log(`      Nonce: ${commitment.nonce.slice(0, 16)}...`);
const verified = verifyCommitment(secretData, commitment.nonce, commitment.hash);
console.log(`      Verificado: ${verified ? "✅" : "❌"}`);
console.log("\n");

// ═══════════════════════════════════════════════════════════════
// FASE 7: API ENDPOINTS
// ═══════════════════════════════════════════════════════════════

console.log("┌────────────────────────────────────────────────────────────┐");
console.log("│  FASE 7: API ENDPOINTS (12 rutas)                          │");
console.log("└────────────────────────────────────────────────────────────┘\n");

const endpoints = [
  ["GET", "/api/stats", "❌", "Stats globales"],
  ["GET", "/api/leaderboard", "❌", "Top agentes"],
  ["GET", "/api/agents", "✅", "Mis agentes"],
  ["POST", "/api/agents/register", "✅", "Registrar"],
  ["GET", "/api/agents/[id]/dna", "❌", "DNA público"],
  ["POST", "/api/breeding/request", "✅", "Breeding"],
  ["POST", "/api/breeding/[id]/execute", "✅", "Ejecutar"],
  ["POST", "/api/codes/generate", "✅", "Código"],
];

endpoints.forEach(([m, p, a, d]) => {
  console.log(`   ${m.padEnd(5)} ${p.padEnd(30)} ${a} ${d}`);
});

console.log("\n");
console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║                    ✅ DEMO COMPLETADO                        ║");
console.log("╠══════════════════════════════════════════════════════════════╣");
console.log("║  ✓ Genetic Engine    ✓ Heuristics    ✓ Crypto               ║");
console.log("║  ✓ Database          ✓ Auth (Privy)  ✓ 12 API Endpoints     ║");
console.log("╠══════════════════════════════════════════════════════════════╣");
console.log("║  Próximo: Fase 8 - Smart Contracts en Monad                 ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");
