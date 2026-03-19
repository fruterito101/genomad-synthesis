// src/app/api/events/route.ts
// API para obtener eventos del blockchain (polling approach)

import { NextRequest, NextResponse } from "next/server";
import { 
  getLatestBlock, 
  getAllEvents,
  getAgentRegisteredEvents,
  getTransferEvents,
} from "@/lib/blockchain/events";

// GET - Get recent events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blocksBack = searchParams.get("blocks") || "100";
    const eventType = searchParams.get("type"); // agentRegistered, transfer, breeding
    
    const latestBlock = await getLatestBlock();
    const fromBlock = latestBlock - BigInt(blocksBack);
    
    let events;
    
    if (eventType === "agentRegistered") {
      events = await getAgentRegisteredEvents(fromBlock, latestBlock);
    } else if (eventType === "transfer") {
      events = await getTransferEvents(fromBlock, latestBlock);
    } else {
      // Get all events
      events = await getAllEvents(fromBlock, latestBlock);
    }
    
    return NextResponse.json({
      success: true,
      fromBlock: fromBlock.toString(),
      toBlock: latestBlock.toString(),
      events,
    });
    
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST - Fetch events for specific block range
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromBlock, toBlock } = body as {
      fromBlock: string;
      toBlock?: string;
    };
    
    if (!fromBlock) {
      return NextResponse.json(
        { error: "fromBlock required" },
        { status: 400 }
      );
    }
    
    const from = BigInt(fromBlock);
    const to = toBlock ? BigInt(toBlock) : await getLatestBlock();
    
    const events = await getAllEvents(from, to);
    
    return NextResponse.json({
      success: true,
      fromBlock: from.toString(),
      toBlock: to.toString(),
      events,
    });
    
  } catch (error) {
    console.error("Fetch events error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
