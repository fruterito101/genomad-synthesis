// src/lib/auth/middleware.ts

import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { getUserByPrivyId } from "@/lib/db";

// Privy server client
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

/**
 * Resultado de autenticación
 */
export interface AuthResult {
  authenticated: boolean;
  privyId?: string;
  userId?: string;
  walletAddress?: string;
  error?: string;
}

/**
 * Verifica token de Privy y retorna datos del usuario
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Obtener token del header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return { authenticated: false, error: "Missing authorization header" };
    }

    const token = authHeader.replace("Bearer ", "");

    // Verificar con Privy
    const verifiedClaims = await privy.verifyAuthToken(token);
    
    if (!verifiedClaims || !verifiedClaims.userId) {
      return { authenticated: false, error: "Invalid token" };
    }

    // Buscar usuario en nuestra DB
    const user = await getUserByPrivyId(verifiedClaims.userId);

    return {
      authenticated: true,
      privyId: verifiedClaims.userId,
      userId: user?.id,
      walletAddress: user?.walletAddress ?? undefined,
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return { authenticated: false, error: "Verification failed" };
  }
}

/**
 * Middleware helper para rutas protegidas
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthResult | NextResponse> {
  const auth = await verifyAuth(request);

  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }

  return auth;
}

/**
 * Middleware helper que requiere wallet conectada
 */
export async function requireWallet(
  request: NextRequest
): Promise<AuthResult | NextResponse> {
  const auth = await requireAuth(request);

  if (auth instanceof NextResponse) {
    return auth;
  }

  if (!auth.walletAddress) {
    return NextResponse.json(
      { error: "Wallet not connected" },
      { status: 403 }
    );
  }

  return auth;
}
