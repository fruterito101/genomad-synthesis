// src/lib/blockchain/events/handlers.ts
// Event handlers that sync on-chain events to DB

import { db } from "@/lib/db";
import { agents, breedingRequests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { CONTRACTS } from "@/lib/blockchain/contracts";
import type {
  AgentRegisteredEvent,
  TransferEvent,
  BreedingRequestedEvent,
  BreedingExecutedEvent,
} from "./listener";

/**
 * Handle AgentRegistered event
 * Links tokenId to agent in DB by matching commitment
 */
export async function handleAgentRegistered(
  event: AgentRegisteredEvent
): Promise<{ success: boolean; agentId?: string; error?: string }> {
  try {
    // Find agent by commitment (dnaCommitment)
    const commitmentHex = event.dnaCommitment;
    
    // Search for agent with matching commitment
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.commitment, commitmentHex))
      .limit(1);
    
    if (!agent) {
      // Agent not in our DB - might be external mint
      console.log("AgentRegistered: No agent found with commitment " + commitmentHex);
      return { success: false, error: "Agent not found in DB" };
    }
    
    // Update agent with on-chain data
    await db
      .update(agents)
      .set({
        tokenId: event.tokenId.toString(),
        contractAddress: CONTRACTS.genomadNFT,
        mintedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agent.id));
    
    console.log("AgentRegistered: Synced agent " + agent.id + " with tokenId " + event.tokenId);
    return { success: true, agentId: agent.id };
    
  } catch (error) {
    console.error("handleAgentRegistered error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Handle Transfer event
 * Updates agent owner in DB
 */
export async function handleTransfer(
  event: TransferEvent
): Promise<{ success: boolean; agentId?: string; error?: string }> {
  try {
    const tokenId = event.tokenId.toString();
    
    // Find agent by tokenId
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.tokenId, tokenId))
      .limit(1);
    
    if (!agent) {
      console.log("Transfer: No agent found with tokenId " + tokenId);
      return { success: false, error: "Agent not found in DB" };
    }
    
    // Note: We don't automatically change ownerId here because
    // the DB ownerId is our internal user ID, not wallet address
    // This would require looking up the new owner by wallet
    
    console.log("Transfer: Agent " + agent.id + " transferred from " + event.from + " to " + event.to);
    return { success: true, agentId: agent.id };
    
  } catch (error) {
    console.error("handleTransfer error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Handle BreedingRequested event
 * Updates breeding request with on-chain requestId
 */
export async function handleBreedingRequested(
  event: BreedingRequestedEvent
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  try {
    // Find breeding request by parent tokenIds
    const parentATokenId = event.parentA.toString();
    const parentBTokenId = event.parentB.toString();
    
    // Get agents by tokenId
    const parentAgents = await db
      .select()
      .from(agents)
      .where(eq(agents.tokenId, parentATokenId));
    
    if (parentAgents.length === 0) {
      console.log("BreedingRequested: Parent A not found with tokenId " + parentATokenId);
      return { success: false, error: "Parent A not found" };
    }
    
    // Find matching breeding request in pending status
    const [request] = await db
      .select()
      .from(breedingRequests)
      .where(
        and(
          eq(breedingRequests.status, "pending"),
          eq(breedingRequests.onChainParentA, parentATokenId),
          eq(breedingRequests.onChainParentB, parentBTokenId)
        )
      )
      .limit(1);
    
    if (!request) {
      console.log("BreedingRequested: No pending request found for parents " + parentATokenId + ", " + parentBTokenId);
      return { success: false, error: "Breeding request not found in DB" };
    }
    
    // Update with on-chain request ID
    await db
      .update(breedingRequests)
      .set({
        onChainRequestId: event.requestId.toString(),
        feePaid: true,
      })
      .where(eq(breedingRequests.id, request.id));
    
    console.log("BreedingRequested: Synced request " + request.id + " with on-chain ID " + event.requestId);
    return { success: true, requestId: request.id };
    
  } catch (error) {
    console.error("handleBreedingRequested error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Handle BreedingExecuted event
 * Updates breeding request status and creates child agent
 */
export async function handleBreedingExecuted(
  event: BreedingExecutedEvent
): Promise<{ success: boolean; requestId?: string; childId?: string; error?: string }> {
  try {
    const onChainRequestId = event.requestId.toString();
    
    // Find breeding request by on-chain ID
    const [request] = await db
      .select()
      .from(breedingRequests)
      .where(eq(breedingRequests.onChainRequestId, onChainRequestId))
      .limit(1);
    
    if (!request) {
      console.log("BreedingExecuted: No request found with on-chain ID " + onChainRequestId);
      return { success: false, error: "Breeding request not found in DB" };
    }
    
    // Update request status
    await db
      .update(breedingRequests)
      .set({
        status: "executed",
        executedAt: new Date(),
        txHash: event.transactionHash,
      })
      .where(eq(breedingRequests.id, request.id));
    
    // If there's a child agent in DB, update its tokenId
    if (request.childId) {
      await db
        .update(agents)
        .set({
          tokenId: event.childTokenId.toString(),
          contractAddress: CONTRACTS.genomadNFT,
          mintedAt: new Date(),
        })
        .where(eq(agents.id, request.childId));
    }
    
    console.log("BreedingExecuted: Request " + request.id + " completed, child tokenId " + event.childTokenId);
    return { success: true, requestId: request.id, childId: request.childId || undefined };
    
  } catch (error) {
    console.error("handleBreedingExecuted error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Process all events from a block range
 */
export async function processEvents(events: {
  agentRegistered: AgentRegisteredEvent[];
  transfers: TransferEvent[];
  breedingRequested: BreedingRequestedEvent[];
  breedingExecuted: BreedingExecutedEvent[];
}) {
  const results = {
    agentRegistered: [] as any[],
    transfers: [] as any[],
    breedingRequested: [] as any[],
    breedingExecuted: [] as any[],
  };

  // Process AgentRegistered events
  for (const event of events.agentRegistered) {
    const result = await handleAgentRegistered(event);
    results.agentRegistered.push({ ...event, ...result });
  }

  // Process Transfer events
  for (const event of events.transfers) {
    const result = await handleTransfer(event);
    results.transfers.push({ ...event, ...result });
  }

  // Process BreedingRequested events
  for (const event of events.breedingRequested) {
    const result = await handleBreedingRequested(event);
    results.breedingRequested.push({ ...event, ...result });
  }

  // Process BreedingExecuted events
  for (const event of events.breedingExecuted) {
    const result = await handleBreedingExecuted(event);
    results.breedingExecuted.push({ ...event, ...result });
  }

  return results;
}
