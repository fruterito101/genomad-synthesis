// src/app/api/agents/register-skill/route.ts
// Endpoint para registro desde genomad-verify skill
// NO requiere auth de Privy - acepta datos pre-calculados del skill

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
      generation = 0,
      botUsername,
      telegramId,
      source = "genomad-verify-skill"
    } = body;

    // Validaciones básicas
    if (!name) {
      return NextResponse.json(
        { error: "Agent name is required" },
        { status: 400 }
      );
    }

    if (!traits || !dnaHash) {
      return NextResponse.json(
        { error: "Traits and dnaHash are required" },
        { status: 400 }
      );
    }

    // Verificar que traits tiene los 8 campos
    const requiredTraits = ["technical", "creativity", "social", "analysis", "empathy", "trading", "teaching", "leadership"];
    for (const trait of requiredTraits) {
      if (typeof traits[trait] !== "number") {
        return NextResponse.json(
          { error: `Missing or invalid trait: ${trait}` },
          { status: 400 }
        );
      }
    }

    const db = getDb();

    // Verificar si ya existe un agente con este hash
    const [existing] = await db
      .select()
      .from(agents)
      .where(eq(agents.dnaHash, dnaHash))
      .limit(1);

    if (existing) {
      // Actualizar si ya existe
      return NextResponse.json({
        success: true,
        action: "updated",
        agent: {
          id: existing.id,
          name: existing.name,
          dnaHash: existing.dnaHash,
          traits: existing.traits,
          fitness: existing.fitness,
          generation: existing.generation,
          createdAt: existing.createdAt,
        },
        message: "Agent already registered. No changes made.",
      });
    }

    // Calcular fitness
    const fitness = calculateTotalFitness(traits);

    // Crear nuevo agente (sin owner por ahora - se vincula después)
    const newAgent = {
      id: uuidv4(),
      ownerId: "00000000-0000-0000-0000-000000000000", // Placeholder - se actualiza al vincular
      name,
      botUsername: botUsername || null,
      dnaHash,
      traits,
      fitness,
      generation,
      lineage: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(agents).values(newAgent);

    console.log(`✅ New agent registered: ${name} (${dnaHash.slice(0, 8)}...)`);

    return NextResponse.json({
      success: true,
      action: "created",
      agent: {
        id: newAgent.id,
        name: newAgent.name,
        dnaHash: newAgent.dnaHash,
        traits: newAgent.traits,
        fitness: newAgent.fitness,
        generation: newAgent.generation,
        createdAt: newAgent.createdAt,
      },
      message: "Agent registered successfully!",
    });

  } catch (error) {
    console.error("Register skill error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

// GET: Lista todos los agentes registrados (para debug/dashboard)
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

    return NextResponse.json({
      total: allAgents.length,
      agents: allAgents,
    });

  } catch (error) {
    console.error("List agents error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
