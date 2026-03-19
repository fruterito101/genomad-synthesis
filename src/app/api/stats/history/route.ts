import { NextResponse } from "next/server"
import { getDb } from "@/lib/db/client"
import { agents, breedingRequests } from "@/lib/db/schema"
import { sql, gte } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const db = getDb()
    
    // Get data for last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    // Get all agents and breeding requests
    const allAgents = await db
      .select({ createdAt: agents.createdAt })
      .from(agents)
      .where(gte(agents.createdAt, sixMonthsAgo))
    
    const allBreedings = await db
      .select({ createdAt: breedingRequests.createdAt })
      .from(breedingRequests)
      .where(gte(breedingRequests.createdAt, sixMonthsAgo))
    
    // Group by month
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = new Date().getMonth()
    
    // Create array for last 6 months
    const data = []
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const monthName = months[monthIndex]
      
      // Count agents and breedings for this month
      const agentCount = allAgents.filter(a => {
        if (!a.createdAt) return false
        const date = new Date(a.createdAt)
        return date.getMonth() === monthIndex
      }).length
      
      const breedingCount = allBreedings.filter(b => {
        if (!b.createdAt) return false
        const date = new Date(b.createdAt)
        return date.getMonth() === monthIndex
      }).length
      
      data.push({
        date: monthName,
        agents: agentCount,
        breedings: breedingCount,
      })
    }
    
    // Calculate cumulative totals for a more interesting chart
    let cumulativeAgents = 0
    let cumulativeBreedings = 0
    const cumulativeData = data.map(d => {
      cumulativeAgents += d.agents
      cumulativeBreedings += d.breedings
      return {
        date: d.date,
        agents: cumulativeAgents,
        breedings: cumulativeBreedings,
      }
    })
    
    return NextResponse.json({
      data: cumulativeData,
      raw: data,
    })
  } catch (error) {
    console.error("[Stats History] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats history" },
      { status: 500 }
    )
  }
}
