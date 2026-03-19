// ═══════════════════════════════════════════════════════════════════
// SYNC EVENTS API
// POST /api/events/sync - Fetch and process blockchain events
// GET /api/events/sync - Get last sync status
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { 
  getLatestBlock, 
  getAllEvents,
} from "@/lib/blockchain/events/listener";
import { processEvents } from "@/lib/blockchain/events/handlers";

// Store last synced block in memory (would use DB/KV in production)
let lastSyncedBlock: bigint | null = null;
let lastSyncTime: Date | null = null;

// Default block range to look back (about 1 hour on Monad)
const DEFAULT_BLOCK_LOOKBACK = BigInt(1800);
// Max blocks per request (to avoid timeout)
const MAX_BLOCKS_PER_SYNC = BigInt(1000);

// ═══════════════════════════════════════════════════════════════════
// POST - Trigger event sync
// ═══════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { fromBlock: fromBlockParam, toBlock: toBlockParam } = body as {
      fromBlock?: string;
      toBlock?: string;
    };
    
    // Get current block
    const latestBlock = await getLatestBlock();
    
    // Determine block range
    let fromBlock: bigint;
    let toBlock: bigint;
    
    if (fromBlockParam) {
      fromBlock = BigInt(fromBlockParam);
    } else if (lastSyncedBlock) {
      fromBlock = lastSyncedBlock + BigInt(1);
    } else {
      // First sync - look back DEFAULT_BLOCK_LOOKBACK blocks
      fromBlock = latestBlock - DEFAULT_BLOCK_LOOKBACK;
      if (fromBlock < BigInt(0)) fromBlock = BigInt(0);
    }
    
    if (toBlockParam) {
      toBlock = BigInt(toBlockParam);
    } else {
      toBlock = latestBlock;
    }
    
    // Limit range to avoid timeout
    if (toBlock - fromBlock > MAX_BLOCKS_PER_SYNC) {
      toBlock = fromBlock + MAX_BLOCKS_PER_SYNC;
    }
    
    // Fetch events
    const events = await getAllEvents(fromBlock, toBlock);
    
    // Process events
    const results = await processEvents(events);
    
    // Update sync state
    lastSyncedBlock = toBlock;
    lastSyncTime = new Date();
    
    // Calculate totals
    const totalEvents = 
      events.agentRegistered.length +
      events.transfers.length +
      events.breedingRequested.length +
      events.breedingExecuted.length;
    
    const successCount =
      results.agentRegistered.filter((r: any) => r.success).length +
      results.transfers.filter((r: any) => r.success).length +
      results.breedingRequested.filter((r: any) => r.success).length +
      results.breedingExecuted.filter((r: any) => r.success).length;
    
    return NextResponse.json({
      success: true,
      sync: {
        fromBlock: fromBlock.toString(),
        toBlock: toBlock.toString(),
        latestBlock: latestBlock.toString(),
        blocksProcessed: (toBlock - fromBlock).toString(),
        hasMore: toBlock < latestBlock,
      },
      events: {
        total: totalEvents,
        agentRegistered: events.agentRegistered.length,
        transfers: events.transfers.length,
        breedingRequested: events.breedingRequested.length,
        breedingExecuted: events.breedingExecuted.length,
      },
      processed: {
        total: successCount,
        results,
      },
      lastSyncTime: lastSyncTime?.toISOString(),
    });
    
  } catch (error) {
    console.error("Event sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// GET - Get sync status
// ═══════════════════════════════════════════════════════════════════

export async function GET() {
  try {
    const latestBlock = await getLatestBlock();
    
    return NextResponse.json({
      status: "ok",
      lastSyncedBlock: lastSyncedBlock?.toString() || null,
      lastSyncTime: lastSyncTime?.toISOString() || null,
      latestBlock: latestBlock.toString(),
      blocksBehind: lastSyncedBlock 
        ? (latestBlock - lastSyncedBlock).toString() 
        : "unknown",
    });
    
  } catch (error) {
    console.error("Get sync status error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
