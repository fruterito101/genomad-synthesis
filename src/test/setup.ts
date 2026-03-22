// src/test/setup.ts
import { vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
}));

// Mock Privy
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    authenticated: true,
    ready: true,
    user: {
      wallet: { address: "0x1234567890123456789012345678901234567890" },
    },
    getAccessToken: vi.fn().mockResolvedValue("mock-token"),
    logout: vi.fn(),
  }),
}));

// Mock wagmi
vi.mock("wagmi", async () => {
  const actual = await vi.importActual("wagmi");
  return {
    ...actual,
    useWriteContract: () => ({
      writeContract: vi.fn(),
      writeContractAsync: vi.fn().mockResolvedValue("0xmockhash"),
      data: undefined,
      isPending: false,
      error: null,
      reset: vi.fn(),
    }),
    useWaitForTransactionReceipt: () => ({
      isLoading: false,
      isSuccess: false,
      error: null,
    }),
    useReadContract: () => ({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    }),
    useReadContracts: () => ({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    }),
  };
});

// Mock NetworkContext
vi.mock("@/contexts/NetworkContext", () => ({
  useNetwork: () => ({
    network: "testnet",
    switchNetwork: vi.fn(),
    chain: { id: 8453, name: "Base Sepolia" },
    contracts: {
      genomadNFT: "0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0",
      breedingFactory: "0x72D60f32185B67606a533dc28DeC3f88E05788De",
      gmdToken: "0x03DD45bA22F57b715a2F30C3C945E57DA0AC7777",
    },
    rpcUrl: "https://sepolia.base.org",
    isMainnet: false,
    isTestnet: true,
  }),
}));
