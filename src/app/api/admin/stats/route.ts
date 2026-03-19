// src/app/api/admin/stats/route.ts
// Estadísticas de seguridad y salud de la plataforma

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { agents, suspiciousAlerts, users } from "@/lib/db/schema";
import { sql, desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    
    // 1. Estadísticas de agentes
    const [agentStats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        active: sql<number>`COUNT(*) FILTER (WHERE is_active = true)`,
        suspicious: sql<number>`COUNT(*) FILTER (WHERE is_suspicious = true)`,
        suspiciousPending: sql<number>`COUNT(*) FILTER (WHERE is_suspicious = true AND reviewed_at IS NULL)`,
        avgFitness: sql<number>`AVG(fitness) FILTER (WHERE is_suspicious = false)`,
        maxFitness: sql<number>`MAX(fitness)`,
        minFitness: sql<number>`MIN(fitness)`,
        linkedAgents: sql<number>`COUNT(*) FILTER (WHERE owner_id != '00000000-0000-0000-0000-000000000000')`,
      })
      .from(agents);
    
    // 2. Estadísticas de usuarios
    const [userStats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        withWallet: sql<number>`COUNT(*) FILTER (WHERE wallet_address IS NOT NULL)`,
        withTelegram: sql<number>`COUNT(*) FILTER (WHERE telegram_id IS NOT NULL)`,
      })
      .from(users);
    
    // 3. Alertas recientes
    const [alertStats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        last24h: sql<number>`COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')`,
        lastWeek: sql<number>`COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')`,
        pending: sql<number>`COUNT(*) FILTER (WHERE reviewed = false)`,
      })
      .from(suspiciousAlerts);
    
    // 4. Distribución de fitness
    const fitnessDistribution = await db
      .select({
        range: sql<string>`
          CASE 
            WHEN fitness < 20 THEN '0-19'
            WHEN fitness < 40 THEN '20-39'
            WHEN fitness < 60 THEN '40-59'
            WHEN fitness < 80 THEN '60-79'
            ELSE '80-92'
          END
        `,
        count: sql<number>`COUNT(*)`,
      })
      .from(agents)
      .where(eq(agents.isSuspicious, false))
      .groupBy(sql`1`)
      .orderBy(sql`1`);
    
    // 5. Top 5 agentes por fitness (no sospechosos)
    const topAgents = await db
      .select({
        id: agents.id,
        name: agents.name,
        fitness: agents.fitness,
      })
      .from(agents)
      .where(eq(agents.isSuspicious, false))
      .orderBy(desc(agents.fitness))
      .limit(5);
    
    // 6. Agentes recientes
    const recentAgents = await db
      .select({
        id: agents.id,
        name: agents.name,
        fitness: agents.fitness,
        createdAt: agents.createdAt,
        isSuspicious: agents.isSuspicious,
      })
      .from(agents)
      .orderBy(desc(agents.createdAt))
      .limit(10);
    
    return NextResponse.json({
      agents: {
        total: Number(agentStats?.total || 0),
        active: Number(agentStats?.active || 0),
        suspicious: Number(agentStats?.suspicious || 0),
        suspiciousPending: Number(agentStats?.suspiciousPending || 0),
        linked: Number(agentStats?.linkedAgents || 0),
        avgFitness: Number(agentStats?.avgFitness?.toFixed(1) || 0),
        maxFitness: Number(agentStats?.maxFitness || 0),
        minFitness: Number(agentStats?.minFitness || 0),
      },
      users: {
        total: Number(userStats?.total || 0),
        withWallet: Number(userStats?.withWallet || 0),
        withTelegram: Number(userStats?.withTelegram || 0),
      },
      alerts: {
        total: Number(alertStats?.total || 0),
        last24h: Number(alertStats?.last24h || 0),
        lastWeek: Number(alertStats?.lastWeek || 0),
        pending: Number(alertStats?.pending || 0),
      },
      fitnessDistribution: fitnessDistribution.map(d => ({
        range: d.range,
        count: Number(d.count),
      })),
      topAgents,
      recentAgents,
      generatedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
