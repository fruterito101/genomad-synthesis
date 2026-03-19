// src/app/api/agents/register-skill/route.ts
// Registro de agentes con validaciones de seguridad reforzadas (v2.0)

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { agents, verificationCodes, users } from "@/lib/db/schema";
import { calculateTotalFitness } from "@/lib/genetic";
import { eq, or, sql, and, gt } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { PrivyClient } from "@privy-io/server-auth";
import { 
  validateAgentRegistration, 
  FITNESS_MAX, 
  TRAIT_AVERAGE_MAX, 
  TRAIT_EXTREME_THRESHOLD,
  MAX_EXTREME_TRAITS 
} from "@/lib/validations/agent";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

const UNLINKED_OWNER = "00000000-0000-0000-0000-000000000000";

export async function POST(request: NextRequest) {
  try {
    // ═══════════════════════════════════════════════════════════
    // 1. RATE LIMITING
    // ═══════════════════════════════════════════════════════════
    const ip = getClientIP(request);
    const rateCheck = checkRateLimit(ip, "register");
    
    if (!rateCheck.allowed) {
      console.warn(`🚫 Rate limited: ${ip}`);
      return NextResponse.json({ 
        error: "RATE_LIMITED",
        message: `Demasiadas solicitudes. Intenta en ${Math.ceil(rateCheck.resetIn / 1000)} segundos.`,
      }, { status: 429 });
    }
    
    const body = await request.json();
    
    // ═══════════════════════════════════════════════════════════
    // 2. VALIDACIÓN CON ZOD
    // ═══════════════════════════════════════════════════════════
    const validation = validateAgentRegistration(body);
    
    if (!validation.valid) {
      console.warn(`❌ Validation failed:`, validation.errors);
      return NextResponse.json({ 
        error: "VALIDATION_ERROR",
        message: "Datos inválidos",
        details: validation.errors,
      }, { status: 400 });
    }
    
    let { name, traits, dnaHash, skillCount, generation, botUsername, code, source } = validation.data;
    
    // Limpiar datos
    name = name?.trim();
    botUsername = botUsername?.trim() || null;
    code = code?.trim()?.toUpperCase() || null;
    
    // ═══════════════════════════════════════════════════════════
    // 3. VALIDACIÓN DE SEGURIDAD (ANTI-FORESTCITO)
    // ═══════════════════════════════════════════════════════════
    const traitValues = Object.values(traits).filter((v): v is number => typeof v === "number");
    const avgTrait = traitValues.reduce((a, b) => a + b, 0) / traitValues.length;
    const extremeTraits = traitValues.filter(v => v > TRAIT_EXTREME_THRESHOLD).length;
    const calculatedFitness = calculateTotalFitness(traits);
    
    // Check 1: Fitness demasiado alto
    if (calculatedFitness > FITNESS_MAX) {
      console.warn(`🚨 BLOCKED: Fitness ${calculatedFitness.toFixed(1)} > ${FITNESS_MAX} for "${name}"`);
      return NextResponse.json({ 
        error: "SUSPICIOUS_FITNESS",
        message: `Fitness ${calculatedFitness.toFixed(1)} excede el máximo permitido (${FITNESS_MAX}). Registro bloqueado.`,
        blocked: true,
        reason: "fitness_too_high",
      }, { status: 400 });
    }
    
    // Check 2: Promedio de traits demasiado alto
    if (avgTrait > TRAIT_AVERAGE_MAX) {
      console.warn(`🚨 BLOCKED: Trait avg ${avgTrait.toFixed(1)} > ${TRAIT_AVERAGE_MAX} for "${name}"`);
      return NextResponse.json({ 
        error: "SUSPICIOUS_TRAITS",
        message: `Promedio de traits (${avgTrait.toFixed(1)}) es sospechosamente alto. Registro bloqueado.`,
        blocked: true,
        reason: "traits_average_too_high",
      }, { status: 400 });
    }
    
    // Check 3: Demasiados traits extremos
    if (extremeTraits > MAX_EXTREME_TRAITS) {
      console.warn(`🚨 BLOCKED: ${extremeTraits} extreme traits for "${name}"`);
      return NextResponse.json({ 
        error: "MANIPULATED_TRAITS",
        message: `Datos manipulados detectados (${extremeTraits} traits >${TRAIT_EXTREME_THRESHOLD}). Registro bloqueado.`,
        blocked: true,
        reason: "too_many_extreme_traits",
      }, { status: 400 });
    }
    
    // ═══════════════════════════════════════════════════════════
    // 4. PROCESAR CÓDIGO DE VINCULACIÓN
    // ═══════════════════════════════════════════════════════════
    const db = getDb();
    let ownerId = UNLINKED_OWNER;
    let linkedToOwner = false;

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

      await db
        .update(verificationCodes)
        .set({ used: true, usedAt: new Date() })
        .where(eq(verificationCodes.id, codeRecord.id));

      ownerId = codeRecord.userId;
      linkedToOwner = true;
      console.log(`🔗 Code ${code} validated, linking to owner ${ownerId.slice(0,8)}...`);
    }

    // ═══════════════════════════════════════════════════════════
    // 5. BUSCAR AGENTE EXISTENTE
    // ═══════════════════════════════════════════════════════════
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

    const fitness = calculatedFitness;
    const traitsWithSkills = { ...traits, skillCount: skillCount || 0 };

    // ═══════════════════════════════════════════════════════════
    // 6. ACTUALIZAR O CREAR AGENTE
    // ═══════════════════════════════════════════════════════════
    if (existing) {
      const newOwnerId = linkedToOwner ? ownerId : existing.ownerId;

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
          // Reset suspicious flag on update (new analysis)
          isSuspicious: false,
          suspiciousReason: null,
          flaggedAt: null,
        })
        .where(eq(agents.id, existing.id));

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
          name,
          botUsername: botUsername || existing.botUsername,
          dnaHash,
          traits,
          skillCount,
          fitness,
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
      botUsername,
      dnaHash,
      traits: traitsWithSkills,
      fitness,
      generation,
      lineage: [],
      isActive: true,
      isSuspicious: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(agents).values(newAgent);

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
        traits,
        skillCount,
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
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      message: "Error interno del servidor",
      details: process.env.NODE_ENV === "development" ? String(error) : undefined,
    }, { status: 500 });
  }
}

// GET endpoint se mantiene igual...
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    
    let currentUserId: string | null = null;
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const privy = new PrivyClient(
          process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
          process.env.PRIVY_APP_SECRET!
        );
        const verifiedClaims = await privy.verifyAuthToken(token);
        const privyId = verifiedClaims.userId;
        
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.privyId, privyId))
          .limit(1);
        
        if (user) {
          currentUserId = user.id;
        }
      } catch (e) {}
    }
    
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
        isSuspicious: agents.isSuspicious,
        createdAt: agents.createdAt,
      })
      .from(agents)
      .where(eq(agents.isSuspicious, false)) // No mostrar sospechosos
      .orderBy(agents.createdAt);

    const ownerIds = [...new Set(allAgents.map(a => a.ownerId).filter(id => id !== UNLINKED_OWNER))];
    
    const ownersMap: Record<string, { walletAddress: string | null; displayName: string | null; telegramUsername: string | null }> = {};
    
    if (ownerIds.length > 0) {
      const owners = await db
        .select({
          id: users.id,
          walletAddress: users.walletAddress,
          displayName: users.displayName,
          telegramUsername: users.telegramUsername,
        })
        .from(users)
        .where(sql`${users.id} IN (${sql.join(ownerIds.map(id => sql`${id}`), sql`, `)})`);
      
      for (const owner of owners) {
        ownersMap[owner.id] = {
          walletAddress: owner.walletAddress,
          displayName: owner.displayName,
          telegramUsername: owner.telegramUsername,
        };
      }
    }

    const agentsWithOwnerInfo = allAgents.map(agent => {
      const traitsObj = agent.traits as any;
      const { skillCount, ...pureTraits } = traitsObj || {};
      const isLinked = agent.ownerId !== UNLINKED_OWNER;
      const ownerInfo = isLinked ? ownersMap[agent.ownerId] : null;
      
      return {
        ...agent,
        name: agent.name?.trim(),
        traits: pureTraits,
        skillCount: skillCount || 0,
        isLinked,
        isMine: currentUserId ? agent.ownerId === currentUserId : false,
        owner: isLinked ? {
          wallet: ownerInfo?.walletAddress ? `${ownerInfo.walletAddress.slice(0, 6)}...${ownerInfo.walletAddress.slice(-4)}` : null,
          walletFull: ownerInfo?.walletAddress || null,
          name: ownerInfo?.displayName || ownerInfo?.telegramUsername || null,
          telegram: ownerInfo?.telegramUsername || null,
        } : null,
      };
    });

    const myCount = agentsWithOwnerInfo.filter(a => a.isMine).length;

    return NextResponse.json({
      total: agentsWithOwnerInfo.length,
      myCount,
      agents: agentsWithOwnerInfo,
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
