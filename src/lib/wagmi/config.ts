import { createConfig, http } from "wagmi";
import { monadTestnet, monadMainnet, activeChain } from "@/lib/blockchain/chains";

// ============================================
// WAGMI CONFIG - Soporte Testnet + Mainnet
// ============================================
export const wagmiConfig = createConfig({
  chains: [monadTestnet, monadMainnet],
  transports: {
    [monadTestnet.id]: http(
      process.env.NEXT_PUBLIC_TESTNET_RPC || "https://testnet-rpc.monad.xyz"
    ),
    [monadMainnet.id]: http(
      process.env.NEXT_PUBLIC_MAINNET_RPC || "https://rpc.monad.xyz"
    ),
  },
  ssr: true,
});

// Re-export chains
export { monadTestnet, monadMainnet, activeChain } from "@/lib/blockchain/chains";
