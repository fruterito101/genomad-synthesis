import { createConfig, http } from "wagmi";
import { sepoliaTestnet } from "@/lib/blockchain/chains";

export const wagmiConfig = createConfig({
  chains: [sepoliaTestnet],
  transports: {
    [sepoliaTestnet.id]: http(process.env.NEXT_PUBLIC_CHAIN_RPC || "https://rpc.sepolia.org"),
  },
  ssr: true,
});
