import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { agents } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  
  const results = await db.select().from(agents).where(eq(agents.name, "jiji")).limit(1);
  const jiji = results[0];
  
  if (jiji) {
    console.log("Found jiji:", jiji.id);
    console.log("Current tokenId:", jiji.tokenId);
    
    await db.update(agents).set({ 
      tokenId: "4"
    }).where(eq(agents.id, jiji.id));
    
    console.log("✅ Updated jiji with tokenId: 4");
  } else {
    console.log("❌ jiji not found");
  }
}

main().catch(console.error);
