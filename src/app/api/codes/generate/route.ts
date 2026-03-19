// src/app/api/codes/generate/route.ts
// Ticket 7.9: Generar código de verificación

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId, createVerificationCode } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar auth
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    // 2. Obtener usuario
    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Generar código (15 min expiry por defecto)
    const verification = await createVerificationCode(user.id, 15);

    return NextResponse.json({
      success: true,
      code: verification.code,
      expiresAt: verification.expiresAt,
      expiresInMinutes: 15,
      instructions: {
        step1: "Copy this code",
        step2: "In your OpenClaw agent, run the genomad-verify skill",
        step3: "Paste the code when prompted",
      },
    });
  } catch (error) {
    console.error("Generate code error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
