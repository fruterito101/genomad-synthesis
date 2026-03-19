// src/hooks/index.ts
// Export all hooks

// GenomadNFT hooks
export {
  useRegisterAgent,
  useActivateAgent,
  useDeactivateAgent,
  useTransferAgent,
  useAgentData,
  useAgentOwner,
  useAgentBalance,
  useTotalAgents,
} from "./useGenomadNFT";

// BreedingFactory hooks
export {
  useRequestBreeding,
  useApproveBreeding,
  useExecuteBreeding,
  useCancelBreeding,
  useBreedingRequest,
  useIsRequestValid,
  useBreedingFee,
} from "./useBreedingFactory";

// Breeding Flow hook
export { useBreedingFlow } from "./useBreedingFlow";

// Auth hook
export { useAuth } from "./useAuth";

// SSR Safe hooks
export { useIsMounted, useIsWagmiReady } from "./useSSRSafe";

// Agent Read hooks
export * from "./useAgentRead";

// Breeding Read hooks
export * from "./useBreedingRead";

// Contract Write helper
export * from "./useContractWrite";

// GMD Token balance
export { useGMDBalance } from "./useGMDBalance";

// Pusher real-time
export { usePusher } from "./usePusher";

// Scroll animation
export { useScrollAnimation } from "./useScrollAnimation";
