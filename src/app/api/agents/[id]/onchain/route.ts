// ═══════════════════════════════════════════════════════════════════
// SYNC ON-CHAIN DATA API
// POST /api/agents/{id}/onchain - Sync tokenId after on-chain mint
// GET /api/agents/{id}/onchain - Verify on-chain status
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createPublicClient, http } from "viem";
import { baseTestnet } from "@/lib/blockchain/chains";
import { CONTRACTS, GENOMAD_NFT_ABI } from "@/lib/blockchain/contracts";

// Public client for reading from chain
const publicClient = createPublicClient({
  chain: baseTestnet,
  transport: http(),
});

// ═══════════════════════════════════════════════════════════════════
// POST - Sync after on-chain mint
// ═══════════════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const { tokenId, txHash, contractAddress } = body as {
      tokenId: string;
      txHash: string;
      contractAddress?: string;
    };
    
    if (!tokenId || !txHash) {
      return NextResponse.json(
        { error: "tokenId and txHash required" },
        { status: 400 }
      );
    }
    
    // 1. Verify agent exists
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);
    
    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }
    
    // 2. Verify on-chain (optional - can be slow)
    let onChainVerified = false;
    try {
      const tokenIdBigInt = BigInt(tokenId);
      const owner = await publicClient.readContract({
        address: CONTRACTS.genomadNFT as `0x${string}`,
        abi: GENOMAD_NFT_ABI,
        functionName: "ownerOf",
        args: [tokenIdBigInt],
      });
      onChainVerified = !!owner;
    } catch {
      // Token might not exist yet if tx is pending
      console.warn(`Could not verify tokenId ${tokenId} on-chain`);
    }
    
    // 3. Update DB with on-chain data
    await db
      .update(agents)
      .set({
        tokenId: tokenId,
        contractAddress: contractAddress || CONTRACTS.genomadNFT,
        mintedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agents.id, id));
    
    return NextResponse.json({
      success: true,
      agentId: id,
      tokenId,
      txHash,
      onChainVerified,
      message: "Agent synced with on-chain data",
    });
    
  } catch (error) {
    console.error("Sync on-chain error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// GET - Check on-chain status
// ═══════════════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    // 1. Get agent from DB
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);
    
    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }
    
    // 2. If no tokenId, not on-chain yet
    if (!agent.tokenId) {
      return NextResponse.json({
        agentId: id,
        isOnChain: false,
        message: "Agent not minted on-chain yet",
      });
    }
    
    // 3. Verify on-chain data
    try {
      const tokenIdBigInt = BigInt(agent.tokenId);
      
      const [owner, agentData] = await Promise.all([
        publicClient.readContract({
          address: CONTRACTS.genomadNFT as `0x${string}`,
          abi: GENOMAD_NFT_ABI,
          functionName: "ownerOf",
          args: [tokenIdBigInt],
        }),
        publicClient.readContract({
          address: CONTRACTS.genomadNFT as `0x${string}`,
          abi: GENOMAD_NFT_ABI,
          functionName: "getAgentData",
          args: [tokenIdBigInt],
        }),
      ]);
      
      return NextResponse.json({
        agentId: id,
        isOnChain: true,
        tokenId: agent.tokenId,
        contractAddress: agent.contractAddress,
        mintedAt: agent.mintedAt,
        onChainData: {
          owner: owner as string,
          dnaCommitment: (agentData as any).dnaCommitment,
          generation: Number((agentData as any).generation),
          isActive: (agentData as any).isActive,
          createdAt: Number((agentData as any).createdAt),
        },
      });
      
    } catch (error) {
      // Token might not exist on-chain (DB out of sync)
      return NextResponse.json({
        agentId: id,
        isOnChain: false,
        tokenId: agent.tokenId,
        error: "Could not verify on-chain - token may not exist",
      });
    }
    
  } catch (error) {
    console.error("Check on-chain error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
