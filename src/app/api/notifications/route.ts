// src/app/api/notifications/route.ts
// GET: obtener notificaciones del usuario (con filtros)
// POST: marcar como leídas / eliminar antiguas

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId } from "@/lib/db";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type NotificationType,
} from "@/lib/notifications";
import {
  getNotifications as getNotificationsFiltered,
  deleteOldNotifications,
  countByType,
} from "@/lib/notifications/channels/database";

/**
 * GET /api/notifications
 * Query params:
 * - limit: number (default 20)
 * - offset: number (default 0)
 * - unread: boolean (filter only unread)
 * - types: comma-separated notification types
 * - stats: boolean (include type counts)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const unreadOnly = searchParams.get("unread") === "true";
    const typesParam = searchParams.get("types");
    const includeStats = searchParams.get("stats") === "true";

    const types = typesParam
      ? (typesParam.split(",") as NotificationType[])
      : undefined;

    // Use filtered version when we have complex filters
    const hasFilters = offset > 0 || unreadOnly || types;
    
    let result;
    if (hasFilters) {
      result = await getNotificationsFiltered({
        userId: user.id,
        limit,
        offset,
        unreadOnly,
        types,
      });
    } else {
      // Simple case: use the simple function
      const notifications = await getNotifications(user.id, limit);
      const unreadCount = await getUnreadCount(user.id);
      result = {
        notifications,
        unreadCount,
        total: notifications.length,
        hasMore: false,
      };
    }

    // Optionally include type counts
    let stats = undefined;
    if (includeStats) {
      stats = await countByType(user.id);
    }

    return NextResponse.json({
      ...result,
      stats,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Body:
 * - action: "read" | "read_all" | "cleanup"
 * - notificationId: string (required for action="read")
 * - olderThanDays: number (optional for action="cleanup", default 30)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { action, notificationId, olderThanDays } = body as {
      action: "read" | "read_all" | "cleanup";
      notificationId?: string;
      olderThanDays?: number;
    };

    switch (action) {
      case "read":
        if (!notificationId) {
          return NextResponse.json(
            { error: "notificationId required" },
            { status: 400 }
          );
        }
        await markAsRead(notificationId, user.id);
        return NextResponse.json({ success: true });

      case "read_all":
        await markAllAsRead(user.id);
        return NextResponse.json({ success: true });

      case "cleanup":
        const deleted = await deleteOldNotifications(
          user.id,
          olderThanDays || 30
        );
        return NextResponse.json({ success: true, deletedCount: deleted });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
