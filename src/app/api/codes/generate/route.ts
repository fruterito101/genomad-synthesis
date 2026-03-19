// src/app/api/codes/generate/route.ts
// Genera código de vinculación para el usuario logueado

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { verificationCodes, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { PrivyClient } from "@privy-io/server-auth";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

function generateCode(): string {
  // Código de 6 caracteres alfanuméricos
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Sin I,O,0,1 para evitar confusión
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación con Privy
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    
    let verifiedClaims;
    try {
      verifiedClaims = await privy.verifyAuthToken(token);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const privyId = verifiedClaims.userId;
    const db = getDb();

    // Buscar o crear usuario
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.privyId, privyId))
      .limit(1);

    if (!user) {
      // Crear usuario si no existe
      const newUser = {
        id: uuidv4(),
        privyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.insert(users).values(newUser);
      user = newUser as any;
    }

    // Generar código único
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const [existing] = await db
        .select()
        .from(verificationCodes)
        .where(eq(verificationCodes.code, code))
        .limit(1);
      
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    // Crear código con expiración de 30 minutos
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await db.insert(verificationCodes).values({
      id: uuidv4(),
      code,
      userId: user.id,
      used: false,
      expiresAt,
      createdAt: new Date(),
    });

    console.log(`🔑 Code generated: ${code} for user ${user.id}`);

    return NextResponse.json({
      success: true,
      code,
      expiresAt: expiresAt.toISOString(),
      expiresInMinutes: 30,
      message: "Dile a tu agente: /genomad-verify " + code,
    });

  } catch (error) {
    console.error("Generate code error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
