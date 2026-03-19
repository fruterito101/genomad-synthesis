// ═══════════════════════════════════════════════════════════════════
// SYNC BREEDING ON-CHAIN DATA
// POST /api/breeding/{requestId}/onchain - Sync after on-chain breeding
// GET /api/breeding/{requestId}/onchain - Check on-chain breeding status
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { breedingRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createPublicClient, http } from "viem";
import { monadTestnet } from "@/lib/blockchain/chains";
import { CONTRACTS, BREEDING_FACTORY_ABI } from "@/lib/blockchain/contracts";

// Public client for reading from chain
const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

// ═══════════════════════════════════════════════════════════════════
// POST - Sync breeding request after on-chain action
// ═══════════════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  
  try {
    const body = await request.json();
    const { 
      onChainRequestId, 
      txHash, 
      action,
      childTokenId,
    } = body as {
      onChainRequestId?: string;
      txHash: string;
      action: "request" | "approve" | "execute" | "cancel";
      childTokenId?: string;
    };
    
    if (!txHash || !action) {
      return NextResponse.json(
        { error: "txHash and action required" },
        { status: 400 }
      );
    }
    
    // 1. Verify breeding request exists
    const [breedingRequest] = await db
      .select()
      .from(breedingRequests)
      .where(eq(breedingRequests.id, requestId))
      .limit(1);
    
    if (!breedingRequest) {
      return NextResponse.json(
        { error: "Breeding request not found" },
        { status: 404 }
      );
    }
    
    // 2. Update based on action
    const updates: Record<string, any> = {
      txHash,
    };
    
    switch (action) {
      case "request":
        if (onChainRequestId) {
          updates.onChainRequestId = onChainRequestId;
        }
        updates.feePaid = true;
        updates.feeTxHash = txHash;
        break;
        
      case "approve":
        updates.parentBApproved = true;
        updates.parentBApprovedAt = new Date();
        updates.status = "approved";
        break;
        
      case "execute":
        updates.status = "executed";
        updates.executedAt = new Date();
        if (childTokenId) {
          // Note: childId in DB is the agent UUID, not tokenId
          // This would need to be linked separately
        }
        break;
        
      case "cancel":
        updates.status = "cancelled";
        break;
    }
    
    // 3. Update DB
    await db
      .update(breedingRequests)
      .set(updates)
      .where(eq(breedingRequests.id, requestId));
    
    return NextResponse.json({
      success: true,
      requestId,
      action,
      txHash,
      message: `Breeding ${action} synced with on-chain`,
    });
    
  } catch (error) {
    console.error("Sync breeding on-chain error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// GET - Check on-chain breeding status
// ═══════════════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  
  try {
    // 1. Get breeding request from DB
    const [breedingRequest] = await db
      .select()
      .from(breedingRequests)
      .where(eq(breedingRequests.id, requestId))
      .limit(1);
    
    if (!breedingRequest) {
      return NextResponse.json(
        { error: "Breeding request not found" },
        { status: 404 }
      );
    }
    
    // 2. If no on-chain request ID, not on-chain yet
    if (!breedingRequest.onChainRequestId) {
      return NextResponse.json({
        requestId,
        isOnChain: false,
        dbStatus: breedingRequest.status,
        message: "Breeding request not submitted on-chain yet",
      });
    }
    
    // 3. Verify on-chain data
    try {
      const onChainId = BigInt(breedingRequest.onChainRequestId);
      
      const [requestData, isValid] = await Promise.all([
        publicClient.readContract({
          address: CONTRACTS.breedingFactory as `0x${string}`,
          abi: BREEDING_FACTORY_ABI,
          functionName: "getRequest",
          args: [onChainId],
        }),
        publicClient.readContract({
          address: CONTRACTS.breedingFactory as `0x${string}`,
          abi: BREEDING_FACTORY_ABI,
          functionName: "isRequestValid",
          args: [onChainId],
        }),
      ]);
      
      return NextResponse.json({
        requestId,
        isOnChain: true,
        onChainRequestId: breedingRequest.onChainRequestId,
        dbStatus: breedingRequest.status,
        isValid,
        onChainData: {
          parentA: Number((requestData as any).parentA),
          parentB: Number((requestData as any).parentB),
          initiator: (requestData as any).initiator,
          parentBOwner: (requestData as any).parentBOwner,
          parentBApproved: (requestData as any).parentBApproved,
          status: (requestData as any).status,
          createdAt: Number((requestData as any).createdAt),
          expiresAt: Number((requestData as any).expiresAt),
        },
      });
      
    } catch (error) {
      return NextResponse.json({
        requestId,
        isOnChain: false,
        onChainRequestId: breedingRequest.onChainRequestId,
        dbStatus: breedingRequest.status,
        error: "Could not verify on-chain - request may not exist",
      });
    }
    
  } catch (error) {
    console.error("Check breeding on-chain error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
