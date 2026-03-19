import { defineChain } from "viem";

// Ethereum Sepolia Testnet
export const sepoliaTestnet = defineChain({
  id: 11155111,
  name: "Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Sepolia ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.org"],
    },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://sepolia.etherscan.io" },
  },
  testnet: true,
});

// Alias for backwards compatibility
export const monadTestnet = sepoliaTestnet;
export const monadMainnet = sepoliaTestnet;

// Active chain
export const activeChain = sepoliaTestnet;
