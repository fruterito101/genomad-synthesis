// src/app/api/events/route.ts
// API para controlar el event listener (admin only)

import { NextRequest, NextResponse } from "next/server";
import { getEventListener, startEventListener, stopEventListener } from "@/lib/blockchain/events";

// GET - Status del listener
export async function GET() {
  try {
    const listener = getEventListener();
    const status = listener.getStatus();
    
    return NextResponse.json({
      success: true,
      listener: status,
    });
  } catch (error) {
    console.error("Get listener status error:", error);
    return NextResponse.json(
      { error: "Failed to get listener status" },
      { status: 500 }
    );
  }
}

// POST - Start/stop listener
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin auth check
    const adminKey = request.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, network } = body as {
      action: "start" | "stop" | "restart";
      network?: "testnet" | "mainnet";
    };

    switch (action) {
      case "start":
        const listener = startEventListener({ network: network || "testnet" });
        return NextResponse.json({
          success: true,
          message: "Event listener started",
          status: listener.getStatus(),
        });

      case "stop":
        stopEventListener();
        return NextResponse.json({
          success: true,
          message: "Event listener stopped",
        });

      case "restart":
        stopEventListener();
        const newListener = startEventListener({ network: network || "testnet" });
        return NextResponse.json({
          success: true,
          message: "Event listener restarted",
          status: newListener.getStatus(),
        });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: start, stop, restart" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Event listener control error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
