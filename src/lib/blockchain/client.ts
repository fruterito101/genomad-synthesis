// src/lib/blockchain/client.ts
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "./chains";

/**
 * Public client for read operations
 */
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(process.env.NEXT_PUBLIC_MONAD_RPC || "https://testnet-rpc.monad.xyz"),
});

/**
 * Create wallet client for write operations (server-side only)
 */
export function createDeployerClient() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY not set");
  }

  const account = privateKeyToAccount(`0x${privateKey.replace("0x", "")}`);

  return createWalletClient({
    account,
    chain: monadTestnet,
    transport: http(process.env.NEXT_PUBLIC_MONAD_RPC || "https://testnet-rpc.monad.xyz"),
  });
}

/**
 * Get deployer address
 */
export function getDeployerAddress(): string {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY not set");
  }

  const account = privateKeyToAccount(`0x${privateKey.replace("0x", "")}`);
  return account.address;
}
