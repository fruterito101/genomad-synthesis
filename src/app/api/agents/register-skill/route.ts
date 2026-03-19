// src/app/api/agents/register-skill/route.ts
// Registro de agentes con vinculación opcional por código

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { agents, verificationCodes } from "@/lib/db/schema";
import { calculateTotalFitness } from "@/lib/genetic";
import { eq, or, sql, and, gt } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const UNLINKED_OWNER = "00000000-0000-0000-0000-000000000000";

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
      code,  // Código de vinculación opcional
      source = "genomad-verify-skill"
    } = body;

    // Limpiar espacios
    name = name?.trim();
    botUsername = botUsername?.trim();
    code = code?.trim()?.toUpperCase();

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
    let ownerId = UNLINKED_OWNER;
    let linkedToOwner = false;

    // Si hay código, verificarlo y obtener el owner
    if (code) {
      const [codeRecord] = await db
        .select()
        .from(verificationCodes)
        .where(
          and(
            eq(verificationCodes.code, code),
            eq(verificationCodes.used, false),
            gt(verificationCodes.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!codeRecord) {
        return NextResponse.json({ 
          error: "INVALID_CODE", 
          message: "Código inválido, expirado o ya usado. Genera uno nuevo en genomad.vercel.app" 
        }, { status: 400 });
      }

      // Marcar código como usado
      await db
        .update(verificationCodes)
        .set({ 
          used: true, 
          usedAt: new Date() 
        })
        .where(eq(verificationCodes.id, codeRecord.id));

      ownerId = codeRecord.userId;
      linkedToOwner = true;
      console.log(`🔗 Code ${code} validated, linking to owner ${ownerId}`);
    }

    // Buscar agente existente
    const [existing] = await db
      .select()
      .from(agents)
      .where(
        or(
          sql`TRIM(${agents.name}) = ${name}`,
          eq(agents.name, name),
          botUsername ? eq(agents.botUsername, botUsername) : sql`false`,
          eq(agents.dnaHash, dnaHash)
        )
      )
      .limit(1);

    // Calcular fitness
    const fitness = calculateTotalFitness(traits);
    const traitsWithSkills = { ...traits, skillCount: skillCount || 0 };

    if (existing) {
      // Determinar nuevo ownerId (si se vincula, actualizar; si no, mantener)
      const newOwnerId = linkedToOwner ? ownerId : existing.ownerId;

      // ACTUALIZAR agente existente
      await db
        .update(agents)
        .set({
          name,
          dnaHash,
          traits: traitsWithSkills,
          fitness,
          botUsername: botUsername || existing.botUsername,
          ownerId: newOwnerId,
          updatedAt: new Date(),
        })
        .where(eq(agents.id, existing.id));

      // Actualizar código con el agentId
      if (code && linkedToOwner) {
        await db
          .update(verificationCodes)
          .set({ agentId: existing.id })
          .where(eq(verificationCodes.code, code));
      }

      const isNowLinked = newOwnerId !== UNLINKED_OWNER;

      console.log(`🔄 Agent updated: ${name} (linked: ${isNowLinked}, fitness: ${fitness.toFixed(1)})`);

      return NextResponse.json({
        success: true,
        action: "updated",
        linked: isNowLinked,
        agent: {
          id: existing.id,
          name: name,
          botUsername: botUsername || existing.botUsername,
          dnaHash: dnaHash,
          traits: traits,
          skillCount: skillCount,
          fitness: fitness,
          generation: existing.generation,
          ownerId: newOwnerId,
          createdAt: existing.createdAt,
        },
        message: isNowLinked 
          ? "✅ Agente actualizado y vinculado a tu cuenta!"
          : "✅ Agente actualizado. Usa un código para vincularlo a tu cuenta.",
      });
    }

    // Crear nuevo agente
    const newAgentId = uuidv4();
    const newAgent = {
      id: newAgentId,
      ownerId,
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

    // Actualizar código con el agentId si existe
    if (code && linkedToOwner) {
      await db
        .update(verificationCodes)
        .set({ agentId: newAgentId })
        .where(eq(verificationCodes.code, code));
    }

    const isLinked = ownerId !== UNLINKED_OWNER;

    console.log(`✅ New agent: ${name} (linked: ${isLinked}, fitness: ${fitness.toFixed(1)})`);

    return NextResponse.json({
      success: true,
      action: "created",
      linked: isLinked,
      agent: {
        id: newAgent.id,
        name: newAgent.name,
        botUsername: newAgent.botUsername,
        dnaHash: newAgent.dnaHash,
        traits: traits,
        skillCount: skillCount,
        fitness: newAgent.fitness,
        generation: newAgent.generation,
        ownerId: newAgent.ownerId,
        createdAt: newAgent.createdAt,
      },
      message: isLinked
        ? "✅ Agente registrado y vinculado a tu cuenta!"
        : "✅ Agente registrado. Ve a genomad.vercel.app para vincularlo a tu cuenta.",
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
        ownerId: agents.ownerId,
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
        name: agent.name?.trim(),
        traits: pureTraits,
        skillCount: skillCount || 0,
        isLinked: agent.ownerId !== UNLINKED_OWNER,
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
