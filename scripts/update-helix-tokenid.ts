import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { agents } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  
  const results = await db.select().from(agents).where(eq(agents.name, "Helix")).limit(1);
  const helix = results[0];
  
  if (helix) {
    console.log("Found Helix:", helix.id);
    console.log("Current tokenId:", helix.tokenId);
    
    await db.update(agents).set({ 
      tokenId: "3"
    }).where(eq(agents.id, helix.id));
    
    console.log("✅ Updated Helix with tokenId: 3");
  } else {
    console.log("❌ Helix not found");
  }
}

main().catch(console.error);
