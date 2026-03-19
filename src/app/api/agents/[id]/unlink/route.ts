// src/app/api/agents/[id]/unlink/route.ts
// Desvincular agente de tu cuenta (no lo elimina, solo lo quita de tu perfil)

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId } from "@/lib/db";
import { getDb } from "@/lib/db/client";
import { agents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const UNLINKED_OWNER = "00000000-0000-0000-0000-000000000000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const db = getDb();
    const [agent] = await db.select().from(agents).where(eq(agents.id, id)).limit(1);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (agent.ownerId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Unlink: set owner to UNLINKED_OWNER and deactivate
    await db.update(agents).set({
      ownerId: UNLINKED_OWNER,
      isActive: false,
      updatedAt: new Date(),
    }).where(eq(agents.id, id));

    return NextResponse.json({
      success: true,
      message: "Agente desvinculado de tu cuenta. Puede ser vinculado nuevamente con un código de verificación.",
      agent: {
        id: agent.id,
        name: agent.name,
        wasUnlinked: true,
      },
    });
  } catch (error) {
    console.error("Unlink agent error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
