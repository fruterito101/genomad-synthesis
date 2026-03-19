// src/app/api/agents/register-skill/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { agents } from "@/lib/db/schema";
import { calculateTotalFitness } from "@/lib/genetic";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      traits, 
      dnaHash, 
      skillCount = 0,
      generation = 0,
      botUsername,
      telegramId,
      source = "genomad-verify-skill"
    } = body;

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

    // Verificar si ya existe
    const [existing] = await db
      .select()
      .from(agents)
      .where(eq(agents.dnaHash, dnaHash))
      .limit(1);

    // Calcular fitness
    const fitness = calculateTotalFitness(traits);
    const traitsWithSkills = { ...traits, skillCount: skillCount || 0 };

    if (existing) {
      // ACTUALIZAR el agente existente con nuevos datos
      await db
        .update(agents)
        .set({
          traits: traitsWithSkills,
          fitness,
          updatedAt: new Date(),
        })
        .where(eq(agents.id, existing.id));

      console.log(`🔄 Agent updated: ${name} (skills: ${skillCount}, fitness: ${fitness.toFixed(1)})`);

      return NextResponse.json({
        success: true,
        action: "updated",
        agent: {
          id: existing.id,
          name: existing.name,
          dnaHash: existing.dnaHash,
          traits: traits,
          skillCount: skillCount,
          fitness: fitness,
          generation: existing.generation,
          createdAt: existing.createdAt,
        },
        message: "Agent updated with latest traits!",
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

    console.log(`✅ New agent registered: ${name} (skills: ${skillCount}, fitness: ${fitness.toFixed(1)})`);

    return NextResponse.json({
      success: true,
      action: "created",
      agent: {
        id: newAgent.id,
        name: newAgent.name,
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
