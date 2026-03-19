import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { agents, breedingRequests } from "../src/lib/db/schema";
import { eq, like, and, or } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  
  // 1. Find all PACOs
  const pacos = await db.select().from(agents).where(like(agents.name, "%PACO%"));
  console.log("Found PACOs:", pacos.length);
  pacos.forEach(p => console.log(`  - ${p.name} (${p.id}) fitness: ${p.fitness}, tokenId: ${p.tokenId}`));
  
  // 2. Keep the best one (highest fitness), delete others
  if (pacos.length > 1) {
    const sorted = pacos.sort((a, b) => (b.fitness || 0) - (a.fitness || 0));
    const best = sorted[0];
    const toDelete = sorted.slice(1);
    
    console.log(`\nKeeping: ${best.name} (fitness: ${best.fitness})`);
    
    for (const p of toDelete) {
      console.log(`Deleting: ${p.name} (${p.id})`);
      await db.delete(agents).where(eq(agents.id, p.id));
    }
    console.log(`✅ Deleted ${toDelete.length} duplicate(s)`);
  }
  
  // 3. Clean up pending/expired breeding requests
  const pendingRequests = await db.select().from(breedingRequests).where(
    or(
      eq(breedingRequests.status, "pending"),
      eq(breedingRequests.status, "approved")
    )
  );
  console.log(`\nPending breeding requests: ${pendingRequests.length}`);
  
  if (pendingRequests.length > 0) {
    for (const req of pendingRequests) {
      console.log(`  Deleting request: ${req.id} (status: ${req.status})`);
      await db.delete(breedingRequests).where(eq(breedingRequests.id, req.id));
    }
    console.log(`✅ Cleaned ${pendingRequests.length} pending request(s)`);
  }
  
  console.log("\n✅ Cleanup complete!");
}

main().catch(console.error);
