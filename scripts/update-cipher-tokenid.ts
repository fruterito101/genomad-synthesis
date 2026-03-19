import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { agents } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  
  // Find Cipher and update tokenId
  const results = await db.select().from(agents).where(eq(agents.name, "Cipher")).limit(1);
  const cipher = results[0];
  
  if (cipher) {
    console.log("Found Cipher:", cipher.id);
    console.log("Current tokenId:", cipher.tokenId);
    
    // Update with tokenId 1 (first mint)
    await db.update(agents).set({ 
      tokenId: "1"
    }).where(eq(agents.id, cipher.id));
    
    console.log("✅ Updated Cipher with tokenId: 1");
  } else {
    console.log("❌ Cipher not found");
  }
}

main().catch(console.error);
