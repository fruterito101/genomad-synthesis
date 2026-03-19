// src/lib/auth/index.ts

export { syncPrivyUser, extractPrivyUserData } from "./sync-user";
export type { PrivyUserData } from "./sync-user";

export { verifyAuth, requireAuth, requireWallet } from "./middleware";
export type { AuthResult } from "./middleware";
