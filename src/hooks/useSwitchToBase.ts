// src/hooks/useSwitchToBase.ts
// Hook para forzar cambio a Base antes de transacciones

import { useCallback } from "react";
import { useSwitchChain, useChainId } from "wagmi";
import { base } from "viem/chains";

export function useSwitchToBase() {
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  
  const isOnBase = chainId === base.id; // 8453
  
  const ensureBase = useCallback(async () => {
    if (chainId !== base.id) {
      console.log("[useSwitchToBase] Switching to Base...", { current: chainId, target: base.id });
      await switchChainAsync({ chainId: base.id });
      console.log("[useSwitchToBase] ✅ Switched to Base");
    }
  }, [chainId, switchChainAsync]);
  
  return { isOnBase, ensureBase, chainId };
}
