import { getDb } from "../lib/db/client";
import { agents, custodyShares, actionApprovals, breedingRequests } from "../lib/db/schema";
import { eq, or } from "drizzle-orm";

async function deleteFruterito() {
  const db = getDb();
  
  // Find Fruterito
  const found = await db.select().from(agents).where(eq(agents.name, "Fruterito"));
  console.log("Found:", found.map(a => ({ id: a.id, name: a.name })));
  
  if (found.length > 0) {
    const agentId = found[0].id;
    
    // Delete related records
    try {
      await db.delete(custodyShares).where(eq(custodyShares.agentId, agentId));
      console.log("Deleted custody_shares");
    } catch (e) { console.log("No custody_shares or error"); }
    
    try {
      await db.delete(actionApprovals).where(eq(actionApprovals.agentId, agentId));
      console.log("Deleted action_approvals");
    } catch (e) { console.log("No action_approvals or error"); }
    
    try {
      await db.delete(breedingRequests).where(
        or(
          eq(breedingRequests.parentAId, agentId),
          eq(breedingRequests.parentBId, agentId)
        )
      );
      console.log("Deleted breeding_requests");
    } catch (e) { console.log("No breeding_requests or error"); }
    
    // Delete agent
    await db.delete(agents).where(eq(agents.id, agentId));
    console.log("✅ Deleted agent Fruterito");
  } else {
    console.log("Fruterito not found");
  }
  
  // Verify remaining
  const remaining = await db.select({ id: agents.id, name: agents.name, ownerId: agents.ownerId }).from(agents);
  console.log("Remaining agents:", remaining);
}

deleteFruterito().catch(console.error);
