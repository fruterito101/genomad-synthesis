// src/app/api/notifications/stream/route.ts
// SSE endpoint para notificaciones en tiempo real

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId } from "@/lib/db";
import { createSSEStream } from "@/lib/notifications/channels/realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/notifications/stream
 * Establece conexión SSE para recibir notificaciones en tiempo real
 * 
 * Usage (frontend):
 * ```ts
 * const eventSource = new EventSource('/api/notifications/stream', {
 *   withCredentials: true
 * });
 * 
 * eventSource.addEventListener('notification', (event) => {
 *   const data = JSON.parse(event.data);
 *   console.log('New notification:', data);
 * });
 * 
 * eventSource.addEventListener('ping', () => {
 *   console.log('Connection alive');
 * });
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Autenticar usuario
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) {
      return auth;
    }

    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Crear stream SSE
    const stream = createSSEStream(user.id);

    // Retornar respuesta SSE
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // Desactivar buffering en nginx
      },
    });
  } catch (error) {
    console.error("SSE stream error:", error);
    return NextResponse.json(
      { error: "Failed to establish SSE connection" },
      { status: 500 }
    );
  }
}
