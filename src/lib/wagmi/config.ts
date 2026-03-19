import { createConfig, http } from "wagmi";
import { monadTestnet } from "@/lib/blockchain/chains";

// ============================================
// WAGMI CONFIG - Monad Testnet
// ============================================
export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(
      process.env.NEXT_PUBLIC_CHAIN_RPC || "https://testnet-rpc.monad.xyz"
    ),
  },
  ssr: true,
});

// Re-export chain for convenience
export { monadTestnet } from "@/lib/blockchain/chains";
