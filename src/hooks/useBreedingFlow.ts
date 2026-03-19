// src/hooks/useBreedingFlow.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";

interface BreedingFlowState {
  step: "idle" | "signing" | "confirming" | "saving" | "complete" | "error";
  txHash?: string;
  error?: string;
}

interface RequestBreedingParams {
  parentAId: string;
  parentBId: string;
  childName?: string;
  crossoverType?: "uniform" | "single" | "weighted";
  parentATokenId?: bigint;
  parentBTokenId?: bigint;
  useOnChain?: boolean;
}

interface BreedingFlowResult {
  state: BreedingFlowState;
  requestBreeding: (params: RequestBreedingParams) => Promise<{ success: boolean; requestId?: string; error?: string }>;
  approveBreeding: (requestId: string, onChainRequestId?: bigint) => Promise<{ success: boolean; error?: string }>;
  executeBreeding: (requestId: string, dnaCommitment: `0x${string}`, onChainRequestId?: bigint) => Promise<{ success: boolean; childId?: string; error?: string }>;
  reset: () => void;
}

// Default SSR-safe values
const defaultState: BreedingFlowState = { step: "idle" };
const defaultResult: BreedingFlowResult = {
  state: defaultState,
  requestBreeding: async () => ({ success: false, error: "Not mounted" }),
  approveBreeding: async () => ({ success: false, error: "Not mounted" }),
  executeBreeding: async () => ({ success: false, error: "Not mounted" }),
  reset: () => {},
};

export function useBreedingFlow(): BreedingFlowResult {
  const [isMounted, setIsMounted] = useState(false);
  const { getAccessToken } = usePrivy();
  const [state, setState] = useState<BreedingFlowState>({ step: "idle" });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const requestBreeding = useCallback(async (params: RequestBreedingParams) => {
    if (!isMounted) return { success: false, error: "Not mounted" };
    
    const { parentAId, parentBId, childName, crossoverType } = params;
    
    try {
      setState({ step: "saving" });
      
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const res = await fetch("/api/breeding/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentAId,
          parentBId,
          childName,
          crossoverType,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create breeding request");
      }

      setState({ step: "complete" });
      return { success: true, requestId: data.request.id };

    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      setState({ step: "error", error });
      return { success: false, error };
    }
  }, [isMounted, getAccessToken]);

  const approveBreeding = useCallback(async (requestId: string) => {
    if (!isMounted) return { success: false, error: "Not mounted" };
    
    try {
      setState({ step: "saving" });
      
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`/api/breeding/${requestId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve");

      setState({ step: "complete" });
      return { success: true };

    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      setState({ step: "error", error });
      return { success: false, error };
    }
  }, [isMounted, getAccessToken]);

  const executeBreeding = useCallback(async (requestId: string, dnaCommitment: `0x${string}`) => {
    if (!isMounted) return { success: false, error: "Not mounted" };
    
    try {
      setState({ step: "saving" });
      
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`/api/breeding/${requestId}/execute`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dnaCommitment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to execute");

      setState({ step: "complete" });
      return { success: true, childId: data.child?.id };

    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      setState({ step: "error", error });
      return { success: false, error };
    }
  }, [isMounted, getAccessToken]);

  const reset = useCallback(() => {
    setState({ step: "idle" });
  }, []);

  // Return SSR-safe defaults if not mounted
  if (!isMounted) {
    return defaultResult;
  }

  return {
    state,
    requestBreeding,
    approveBreeding,
    executeBreeding,
    reset,
  };
}

export default useBreedingFlow;
