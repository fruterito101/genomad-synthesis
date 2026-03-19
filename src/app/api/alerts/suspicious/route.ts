// src/app/api/alerts/suspicious/route.ts
// Endpoint para recibir alertas de agentes sospechosos desde el skill

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { suspiciousAlerts } from "@/lib/db/schema";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { desc, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rateCheck = checkRateLimit(ip, "alert");
    
    if (!rateCheck.allowed) {
      return NextResponse.json({ 
        error: "RATE_LIMITED",
        message: "Demasiadas alertas. Intenta más tarde.",
      }, { status: 429 });
    }
    
    const body = await request.json();
    const { timestamp, agentName, reason, traits, fitness, files } = body;
    
    // Validar datos mínimos
    if (!agentName || !reason) {
      return NextResponse.json({ 
        error: "MISSING_FIELDS",
        message: "agentName y reason son requeridos" 
      }, { status: 400 });
    }
    
    const db = getDb();
    
    // Guardar alerta
    const [alert] = await db.insert(suspiciousAlerts).values({
      agentName: String(agentName).slice(0, 100),
      reason: String(reason).slice(0, 500),
      traits: traits || {},
      fitness: typeof fitness === "number" ? fitness : 0,
      fileStats: files || {},
      reportedAt: timestamp ? new Date(timestamp) : new Date(),
      sourceIp: ip,
      source: "genomad-verify-skill",
    }).returning();
    
    console.warn(`🚨 SUSPICIOUS ALERT #${alert.id.slice(0,8)}: ${agentName} - ${reason}`);
    
    // TODO: Notificar por webhook (Discord/Telegram) si está configurado
    // await notifyAdmins({ agentName, reason, fitness });
    
    return NextResponse.json({ 
      success: true, 
      message: "Alert received",
      alertId: alert.id,
    });
    
  } catch (error) {
    console.error("Alert error:", error);
    return NextResponse.json({ 
      error: "INTERNAL_ERROR",
      message: "Failed to process alert" 
    }, { status: 500 });
  }
}

// GET - Listar alertas (para admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewed = searchParams.get("reviewed");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    
    const db = getDb();
    
    let query = db.select().from(suspiciousAlerts);
    
    if (reviewed === "true") {
      query = query.where(eq(suspiciousAlerts.reviewed, true)) as any;
    } else if (reviewed === "false") {
      query = query.where(eq(suspiciousAlerts.reviewed, false)) as any;
    }
    
    const alerts = await query
      .orderBy(desc(suspiciousAlerts.createdAt))
      .limit(limit);
    
    return NextResponse.json({
      total: alerts.length,
      alerts,
    });
    
  } catch (error) {
    console.error("List alerts error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
