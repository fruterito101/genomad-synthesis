// src/lib/blockchain/events/handlers.ts
import { getDb } from "@/lib/db/client";
import { agents, breedingRequests, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type {
  AgentRegisteredEvent,
  TransferEvent,
  BreedingRequestedEvent,
  BreedingExecutedEvent,
} from "./types";

// ============================================
// GenomadNFT Event Handlers
// ============================================

/**
 * Handle AgentRegistered event
 * Updates agent with tokenId and minted timestamp
 */
export async function handleAgentRegistered(event: AgentRegisteredEvent): Promise<void> {
  console.log("[EVENT] AgentRegistered:", {
    tokenId: event.tokenId.toString(),
    owner: event.owner,
    dnaCommitment: event.dnaCommitment,
  });

  const db = getDb();

  // Find agent by dnaCommitment (commitment field)
  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.commitment, event.dnaCommitment))
    .limit(1);

  if (agent) {
    // Update with on-chain data
    await db
      .update(agents)
      .set({
        tokenId: event.tokenId.toString(),
        mintedAt: new Date(),
      })
      .where(eq(agents.id, agent.id));

    console.log("[EVENT] Agent updated with tokenId:", agent.id);
  } else {
    // Agent not in DB yet - could be minted directly on-chain
    // Find or create user by wallet
    let userId: string | undefined;
    
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.wallet, event.owner.toLowerCase()))
      .limit(1);

    if (existingUser) {
      userId = existingUser.id;
    }

    if (userId) {
      // Create agent record
      console.log("[EVENT] Creating new agent from on-chain event");
      // Note: This would need more data from chain to create full agent
      // For now, just log that we saw it
    }
  }
}

/**
 * Handle Transfer event
 * Updates agent owner when transferred
 */
export async function handleTransfer(event: TransferEvent): Promise<void> {
  console.log("[EVENT] Transfer:", {
    tokenId: event.tokenId.toString(),
    from: event.from,
    to: event.to,
  });

  const db = getDb();

  // Skip mints (from = 0x0)
  if (event.from === "0x0000000000000000000000000000000000000000") {
    console.log("[EVENT] Skipping mint transfer");
    return;
  }

  // Find agent by tokenId
  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.tokenId, event.tokenId.toString()))
    .limit(1);

  if (!agent) {
    console.log("[EVENT] Agent not found for tokenId:", event.tokenId.toString());
    return;
  }

  // Find new owner
  const [newOwner] = await db
    .select()
    .from(users)
    .where(eq(users.wallet, event.to.toLowerCase()))
    .limit(1);

  if (newOwner) {
    // Update owner
    await db
      .update(agents)
      .set({ ownerId: newOwner.id })
      .where(eq(agents.id, agent.id));

    console.log("[EVENT] Agent transferred to new owner:", newOwner.id);
  } else {
    console.log("[EVENT] New owner not in DB:", event.to);
    // Could create a placeholder user here
  }
}

// ============================================
// BreedingFactory Event Handlers
// ============================================

/**
 * Handle BreedingRequested event
 * Links on-chain request to DB request
 */
export async function handleBreedingRequested(event: BreedingRequestedEvent): Promise<void> {
  console.log("[EVENT] BreedingRequested:", {
    requestId: event.requestId.toString(),
    parentA: event.parentA.toString(),
    parentB: event.parentB.toString(),
    initiator: event.initiator,
  });

  const db = getDb();

  // Find matching DB request by parents (recent)
  const recentTime = new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes

  // Find by parent tokenIds
  const [parentAAgent] = await db
    .select()
    .from(agents)
    .where(eq(agents.tokenId, event.parentA.toString()))
    .limit(1);

  const [parentBAgent] = await db
    .select()
    .from(agents)
    .where(eq(agents.tokenId, event.parentB.toString()))
    .limit(1);

  if (parentAAgent && parentBAgent) {
    // Find pending request with these parents
    const [request] = await db
      .select()
      .from(breedingRequests)
      .where(
        and(
          eq(breedingRequests.parentAId, parentAAgent.id),
          eq(breedingRequests.parentBId, parentBAgent.id),
          eq(breedingRequests.status, "pending")
        )
      )
      .limit(1);

    if (request) {
      // Update with on-chain requestId
      await db
        .update(breedingRequests)
        .set({
          onChainRequestId: event.requestId.toString(),
          feeTxHash: event.transactionHash,
        })
        .where(eq(breedingRequests.id, request.id));

      console.log("[EVENT] Breeding request linked:", request.id);
    }
  }
}

/**
 * Handle BreedingExecuted event
 * Updates breeding request and links child tokenId
 */
export async function handleBreedingExecuted(event: BreedingExecutedEvent): Promise<void> {
  console.log("[EVENT] BreedingExecuted:", {
    requestId: event.requestId.toString(),
    childTokenId: event.childTokenId.toString(),
  });

  const db = getDb();

  // Find request by on-chain ID
  const [request] = await db
    .select()
    .from(breedingRequests)
    .where(eq(breedingRequests.onChainRequestId, event.requestId.toString()))
    .limit(1);

  if (request && request.childId) {
    // Update child with tokenId
    await db
      .update(agents)
      .set({
        tokenId: event.childTokenId.toString(),
        mintedAt: new Date(),
      })
      .where(eq(agents.id, request.childId));

    // Update request with tx hash
    await db
      .update(breedingRequests)
      .set({ txHash: event.transactionHash })
      .where(eq(breedingRequests.id, request.id));

    console.log("[EVENT] Child agent minted:", request.childId);
  }
}
