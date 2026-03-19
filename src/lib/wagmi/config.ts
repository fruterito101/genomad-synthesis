// src/lib/wagmi/config.ts
import { createConfig, http } from "wagmi";
import { monadTestnet } from "@/lib/blockchain/chains";

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(process.env.NEXT_PUBLIC_MONAD_RPC || "https://testnet-rpc.monad.xyz"),
  },
  ssr: true,
});
