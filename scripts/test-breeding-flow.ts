// scripts/test-breeding-flow.ts
// Test del flujo de breeding

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { agents, users, breedingRequests } from "../src/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

const DATABASE_URL = process.env.DATABASE_URL!;

async function main() {
  console.log("🧪 Testing Genomad Breeding Flow\n");
  
  const client = postgres(DATABASE_URL);
  const db = drizzle(client);
  
  try {
    // 1. Listar usuarios
    console.log("👤 Usuarios en DB:");
    const usersList = await db.select().from(users).limit(5);
    for (const u of usersList) {
      console.log(`  - ${u.id.slice(0, 8)}... | ${u.wallet?.slice(0, 10) || u.telegramUsername || "sin wallet"}`);
    }
    
    if (usersList.length === 0) {
      console.log("  ⚠️  No hay usuarios. Creando usuario de prueba...");
      const [testUser] = await db.insert(users).values({
        privyId: `test-${Date.now()}`,
        wallet: "0xTEST" + crypto.randomBytes(18).toString("hex"),
      }).returning();
      usersList.push(testUser);
      console.log(`  ✅ Usuario creado: ${testUser.id.slice(0, 8)}...`);
    }
    
    // 2. Listar agentes
    console.log("\n🤖 Agentes en DB:");
    const agentsList = await db.select().from(agents).orderBy(desc(agents.createdAt)).limit(10);
    for (const a of agentsList) {
      console.log(`  - ${a.name} | Gen ${a.generation} | Fitness ${a.fitness?.toFixed(1)} | TokenID: ${a.tokenId || "none"}`);
    }
    
    // 3. Crear agentes de prueba si hay menos de 2
    const testOwnerId = usersList[0].id;
    
    if (agentsList.length < 2) {
      console.log("\n📝 Creando agentes de prueba...");
      
      const testAgents = [
        {
          name: "TestAgent-Alpha",
          traits: { technical: 85, creativity: 70, social: 60, analysis: 90, empathy: 50, trading: 75, teaching: 65, leadership: 80 },
          fitness: 72.5,
        },
        {
          name: "TestAgent-Beta", 
          traits: { technical: 60, creativity: 95, social: 80, analysis: 55, empathy: 85, trading: 45, teaching: 90, leadership: 50 },
          fitness: 68.8,
        },
        {
          name: "TestAgent-Gamma",
          traits: { technical: 75, creativity: 75, social: 75, analysis: 75, empathy: 75, trading: 75, teaching: 75, leadership: 75 },
          fitness: 75.0,
        },
      ];
      
      for (const ta of testAgents) {
        const dnaHash = crypto.randomBytes(32).toString("hex");
        const [created] = await db.insert(agents).values({
          ownerId: testOwnerId,
          name: ta.name,
          dnaHash,
          traits: ta.traits,
          fitness: ta.fitness,
          generation: 0,
          lineage: [],
        }).returning();
        console.log(`  ✅ Creado: ${created.name} (${created.id.slice(0, 8)}...)`);
      }
      
      // Refrescar lista
      const refreshedAgents = await db.select().from(agents).orderBy(desc(agents.createdAt)).limit(10);
      agentsList.length = 0;
      agentsList.push(...refreshedAgents);
    }
    
    // 4. Listar breeding requests
    console.log("\n🧬 Breeding Requests:");
    const requests = await db.select().from(breedingRequests).orderBy(desc(breedingRequests.createdAt)).limit(5);
    if (requests.length === 0) {
      console.log("  (ninguno)");
    } else {
      for (const r of requests) {
        console.log(`  - ${r.id.slice(0, 8)}... | Status: ${r.status} | On-chain: ${r.onChainRequestId || "none"}`);
      }
    }
    
    // 5. Crear un breeding request de prueba
    if (agentsList.length >= 2) {
      const parentA = agentsList[0];
      const parentB = agentsList[1];
      
      console.log(`\n🧪 Creando breeding request de prueba...`);
      console.log(`  Parent A: ${parentA.name}`);
      console.log(`  Parent B: ${parentB.name}`);
      
      const [newRequest] = await db.insert(breedingRequests).values({
        initiatorId: testOwnerId,
        parentAId: parentA.id,
        parentBId: parentB.id,
        parentAOwnerId: parentA.ownerId,
        parentBOwnerId: parentB.ownerId,
        status: "pending",
        parentAApproved: true,
        parentBApproved: true, // Auto-approve for test
        crossoverType: "weighted",
        childName: `Child-${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }).returning();
      
      console.log(`  ✅ Request creado: ${newRequest.id.slice(0, 8)}...`);
      console.log(`  Status: ${newRequest.status}`);
      console.log(`  Parent A Approved: ${newRequest.parentAApproved}`);
      console.log(`  Parent B Approved: ${newRequest.parentBApproved}`);
    }
    
    // 6. Resumen
    console.log("\n📊 Resumen:");
    console.log(`  Usuarios: ${usersList.length}`);
    console.log(`  Agentes: ${agentsList.length}`);
    console.log(`  Requests: ${requests.length + 1}`);
    
    console.log("\n✅ Tests completados!");
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.end();
  }
}

main();
