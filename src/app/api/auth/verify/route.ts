// src/app/api/auth/verify/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  validateVerificationCode,
  useVerificationCode,
  getUserByPrivyId,
  createAgent,
} from "@/lib/db";
import { heuristicsEngine } from "@/lib/heuristics";
import { calculateDNAHash, calculateTotalFitness } from "@/lib/genetic";
import type { AgentDNA } from "@/lib/genetic/types";

/**
 * POST /api/auth/verify
 * 
 * Endpoint para que agentes OpenClaw se registren.
 * Recibe código de verificación + archivos del agente.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      code,
      agentName,
      botUsername,
      files,
    } = body as {
      code: string;
      agentName: string;
      botUsername?: string;
      files: {
        soul?: string;
        identity?: string;
        tools?: string;
      };
    };

    // Validar campos requeridos
    if (!code || !agentName) {
      return NextResponse.json(
        { error: "Missing required fields: code, agentName" },
        { status: 400 }
      );
    }

    if (!files?.soul && !files?.identity) {
      return NextResponse.json(
        { error: "At least SOUL.md or IDENTITY.md required" },
        { status: 400 }
      );
    }

    // Validar código
    const result = await validateVerificationCode(code);
    if (!result.valid || !result.verification) {
      return NextResponse.json(
        { error: result.error || "Invalid or expired verification code" },
        { status: 401 }
      );
    }

    const verification = result.verification;

    // Obtener usuario
    const user = await getUserByPrivyId(verification.userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Analizar archivos con heurísticas
    const traits = heuristicsEngine.extractTraits({
      soul: files.soul || "",
      identity: files.identity || "",
      tools: files.tools || "",
    });

    // Calcular fitness
    const fitness = calculateTotalFitness(traits);

    // Crear DNA
    const dnaBase: Omit<AgentDNA, "hash"> = {
      name: agentName,
      traits,
      generation: 0, // Genesis
      lineage: [],
      mutations: 0,
    };

    const dna: AgentDNA = {
      ...dnaBase,
      hash: calculateDNAHash(dnaBase),
    };

    // Guardar agente en DB
    const agent = await createAgent({
      ownerId: user.id,
      name: agentName,
      dnaHash: dna.hash,
      traits: dna.traits,
      generation: 0,
      lineage: [],
      fitness,
      botUsername: botUsername || null,
    });

    // Marcar código como usado
    await useVerificationCode(code, agent.id);

    return NextResponse.json({
      success: true,
      message: "Agent registered successfully",
      agent: {
        id: agent.id,
        name: agent.name,
        dnaHash: agent.dnaHash,
        traits: agent.traits,
        generation: agent.generation,
        fitness: agent.fitness,
      },
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/verify?code=XXXXXX
 * 
 * Verifica si un código es válido (sin usarlo)
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Missing code parameter" },
      { status: 400 }
    );
  }

  const result = await validateVerificationCode(code);

  return NextResponse.json({
    valid: result.valid,
    expiresAt: result.verification?.expiresAt || null,
    error: result.error,
  });
}
