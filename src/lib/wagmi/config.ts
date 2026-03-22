import { createConfig, http } from "wagmi";
import { base } from "viem/chains";
import { baseTestnet, baseMainnet, activeChain } from "@/lib/blockchain/chains";

// ============================================
// WAGMI CONFIG - Base Testnet + Mainnet
// ============================================
export const wagmiConfig = createConfig({
  chains: [baseTestnet, baseMainnet],
  transports: {
    [baseTestnet.id]: http(
      process.env.NEXT_PUBLIC_TESTNET_RPC || "https://sepolia.base.org"
    ),
    [baseMainnet.id]: http(
      process.env.NEXT_PUBLIC_MAINNET_RPC || "https://mainnet.base.org"
    ),
  },
  ssr: true,
});

// Re-export chains
export { baseTestnet, baseMainnet, activeChain } from "@/lib/blockchain/chains";
