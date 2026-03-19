// src/lib/auth/sync-user.ts

import { upsertUserByPrivyId, linkWallet, getUserByPrivyId } from "@/lib/db";

/**
 * Datos del usuario de Privy
 */
export interface PrivyUserData {
  privyId: string;
  telegramId?: number;
  telegramUsername?: string;
  walletAddress?: string;
  email?: string;
}

/**
 * Sincroniza usuario de Privy con nuestra DB
 * Crea si no existe, actualiza si existe
 */
export async function syncPrivyUser(data: PrivyUserData) {
  const { privyId, telegramId, telegramUsername, walletAddress } = data;

  // Upsert usuario base (telegramId is stored as string in DB)
  const user = await upsertUserByPrivyId({
    privyId,
    telegramId: telegramId ? String(telegramId) : null,
    telegramUsername: telegramUsername ?? null,
  });

  // Vincular wallet si la tiene y no está vinculada
  if (walletAddress && !user.walletAddress) {
    await linkWallet(user.id, walletAddress);
    // Re-fetch para tener datos actualizados
    return getUserByPrivyId(privyId);
  }

  return user;
}

/**
 * Extrae datos relevantes del objeto Privy user
 */
export function extractPrivyUserData(privyUser: {
  id: string;
  telegram?: { telegramUserId?: string; username?: string };
  wallet?: { address: string };
  email?: { address: string };
}): PrivyUserData {
  return {
    privyId: privyUser.id,
    telegramId: privyUser.telegram?.telegramUserId
      ? parseInt(privyUser.telegram.telegramUserId)
      : undefined,
    telegramUsername: privyUser.telegram?.username,
    walletAddress: privyUser.wallet?.address,
    email: privyUser.email?.address,
  };
}
