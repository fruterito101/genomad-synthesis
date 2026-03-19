// src/app/api/agents/register-skill/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { agents } from "@/lib/db/schema";
import { calculateTotalFitness } from "@/lib/genetic";
import { eq, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { 
      name, 
      traits, 
      dnaHash, 
      skillCount = 0,
      generation = 0,
      botUsername,
      telegramId,
      source = "genomad-verify-skill"
    } = body;

    // Limpiar espacios en nombre y username
    name = name?.trim();
    botUsername = botUsername?.trim();

    if (!name) {
      return NextResponse.json({ error: "Agent name is required" }, { status: 400 });
    }

    if (!traits || !dnaHash) {
      return NextResponse.json({ error: "Traits and dnaHash are required" }, { status: 400 });
    }

    const requiredTraits = ["technical", "creativity", "social", "analysis", "empathy", "trading", "teaching", "leadership"];
    for (const trait of requiredTraits) {
      if (typeof traits[trait] !== "number") {
        return NextResponse.json({ error: `Missing or invalid trait: ${trait}` }, { status: 400 });
      }
    }

    const db = getDb();

    // Buscar por NOMBRE o BOTUSERNAME (sin duplicados)
    const conditions = [eq(agents.name, name)];
    if (botUsername) {
      conditions.push(eq(agents.botUsername, botUsername));
    }

    const [existing] = await db
      .select()
      .from(agents)
      .where(or(...conditions))
      .limit(1);

    // Calcular fitness
    const fitness = calculateTotalFitness(traits);
    const traitsWithSkills = { ...traits, skillCount: skillCount || 0 };

    if (existing) {
      // ACTUALIZAR el agente existente
      await db
        .update(agents)
        .set({
          name,  // Actualizar nombre limpio
          dnaHash,
          traits: traitsWithSkills,
          fitness,
          botUsername: botUsername || existing.botUsername,
          updatedAt: new Date(),
        })
        .where(eq(agents.id, existing.id));

      console.log(`🔄 Agent updated: ${name} (skills: ${skillCount}, fitness: ${fitness.toFixed(1)})`);

      return NextResponse.json({
        success: true,
        action: "updated",
        agent: {
          id: existing.id,
          name: name,
          botUsername: botUsername || existing.botUsername,
          dnaHash: dnaHash,
          traits: traits,
          skillCount: skillCount,
          fitness: fitness,
          generation: existing.generation,
          createdAt: existing.createdAt,
        },
        message: "Agent DNA updated! Your agent has evolved.",
      });
    }

    // Crear nuevo agente
    const newAgent = {
      id: uuidv4(),
      ownerId: "00000000-0000-0000-0000-000000000000",
      name,
      botUsername: botUsername || null,
      dnaHash,
      traits: traitsWithSkills,
      fitness,
      generation,
      lineage: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(agents).values(newAgent);

    console.log(`✅ New agent: ${name} @${botUsername} (skills: ${skillCount}, fitness: ${fitness.toFixed(1)})`);

    return NextResponse.json({
      success: true,
      action: "created",
      agent: {
        id: newAgent.id,
        name: newAgent.name,
        botUsername: newAgent.botUsername,
        dnaHash: newAgent.dnaHash,
        traits: traits,
        skillCount: skillCount,
        fitness: newAgent.fitness,
        generation: newAgent.generation,
        createdAt: newAgent.createdAt,
      },
      message: "Agent registered successfully!",
    });

  } catch (error) {
    console.error("Register skill error:", error);
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  try {
    const db = getDb();
    
    const allAgents = await db
      .select({
        id: agents.id,
        name: agents.name,
        botUsername: agents.botUsername,
        dnaHash: agents.dnaHash,
        traits: agents.traits,
        fitness: agents.fitness,
        generation: agents.generation,
        isActive: agents.isActive,
        createdAt: agents.createdAt,
      })
      .from(agents)
      .orderBy(agents.createdAt);

    const agentsWithSkills = allAgents.map(agent => {
      const traitsObj = agent.traits as any;
      const { skillCount, ...pureTraits } = traitsObj || {};
      return {
        ...agent,
        name: agent.name?.trim(),  // Limpiar por si acaso
        traits: pureTraits,
        skillCount: skillCount || 0,
      };
    });

    return NextResponse.json({
      total: agentsWithSkills.length,
      agents: agentsWithSkills,
    });

  } catch (error) {
    console.error("List agents error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "Agent ID required" }, { status: 400 });
    }

    const db = getDb();
    await db.delete(agents).where(eq(agents.id, id));

    return NextResponse.json({ success: true, message: "Agent deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
