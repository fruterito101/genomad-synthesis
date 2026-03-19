// src/hooks/useBreedingFlow.ts
"use client";

/**
 * Hook que integra el flujo completo de breeding:
 * 1. Usuario firma TX on-chain (opcional)
 * 2. Se guarda en DB con referencia a TX
 * 
 * Flujo:
 * - requestBreeding: Crea request en DB, opcionalmente on-chain
 * - approveBreeding: Aprueba request en DB, opcionalmente on-chain
 * - executeBreeding: Ejecuta breeding en DB, opcionalmente on-chain
 */

import { useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRequestBreeding, useApproveBreeding, useExecuteBreeding, useBreedingFee } from "./useBreedingFactory";

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
  // On-chain params (optional - if provided, will sign TX)
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

export function useBreedingFlow(): BreedingFlowResult {
  const { getAccessToken } = usePrivy();
  const [state, setState] = useState<BreedingFlowState>({ step: "idle" });

  // On-chain hooks
  const { fee } = useBreedingFee();
  const { 
    requestAsync: requestOnChain, 
    isPending: requestPending,
    isConfirming: requestConfirming,
    reset: resetRequest 
  } = useRequestBreeding();
  
  const {
    approveAsync: approveOnChain,
    isPending: approvePending,
    isConfirming: approveConfirming,
    reset: resetApprove
  } = useApproveBreeding();
  
  const {
    executeAsync: executeOnChain,
    isPending: executePending,
    isConfirming: executeConfirming,
    reset: resetExecute
  } = useExecuteBreeding();

  const requestBreeding = useCallback(async (params: RequestBreedingParams) => {
    const { parentAId, parentBId, childName, crossoverType, parentATokenId, parentBTokenId, useOnChain } = params;
    
    try {
      let txHash: string | undefined;
      
      // Step 1: Sign on-chain TX (if requested)
      if (useOnChain && parentATokenId && parentBTokenId && fee) {
        setState({ step: "signing" });
        
        try {
          txHash = await requestOnChain(parentATokenId, parentBTokenId, fee);
          setState({ step: "confirming", txHash });
          
          // Wait a bit for confirmation (the hook handles this internally)
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (err) {
          console.error("On-chain request failed:", err);
          // Continue without on-chain - DB only
          txHash = undefined;
        }
      }

      // Step 2: Save to DB
      setState({ step: "saving", txHash });
      
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
          // Include TX data if we have it
          txHash,
          onChainParentA: parentATokenId?.toString(),
          onChainParentB: parentBTokenId?.toString(),
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create breeding request");
      }

      setState({ step: "complete", txHash });
      return { success: true, requestId: data.request.id };

    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      setState({ step: "error", error });
      return { success: false, error };
    }
  }, [getAccessToken, requestOnChain, fee]);

  const approveBreeding = useCallback(async (requestId: string, onChainRequestId?: bigint) => {
    try {
      let txHash: string | undefined;

      // Step 1: Sign on-chain TX (if onChainRequestId provided)
      if (onChainRequestId) {
        setState({ step: "signing" });
        
        try {
          txHash = await approveOnChain(onChainRequestId);
          setState({ step: "confirming", txHash });
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (err) {
          console.error("On-chain approve failed:", err);
        }
      }

      // Step 2: Approve in DB
      setState({ step: "saving", txHash });
      
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`/api/breeding/${requestId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txHash }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve");

      setState({ step: "complete", txHash });
      return { success: true };

    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      setState({ step: "error", error });
      return { success: false, error };
    }
  }, [getAccessToken, approveOnChain]);

  const executeBreeding = useCallback(async (
    requestId: string, 
    dnaCommitment: `0x${string}`,
    onChainRequestId?: bigint
  ) => {
    try {
      let txHash: string | undefined;

      // Step 1: Execute on-chain (if onChainRequestId provided)
      if (onChainRequestId) {
        setState({ step: "signing" });
        
        try {
          txHash = await executeOnChain(onChainRequestId, dnaCommitment);
          setState({ step: "confirming", txHash });
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (err) {
          console.error("On-chain execute failed:", err);
        }
      }

      // Step 2: Execute in DB
      setState({ step: "saving", txHash });
      
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`/api/breeding/${requestId}/execute`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txHash, dnaCommitment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to execute");

      setState({ step: "complete", txHash });
      return { success: true, childId: data.child?.id };

    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      setState({ step: "error", error });
      return { success: false, error };
    }
  }, [getAccessToken, executeOnChain]);

  const reset = useCallback(() => {
    setState({ step: "idle" });
    resetRequest();
    resetApprove();
    resetExecute();
  }, [resetRequest, resetApprove, resetExecute]);

  return {
    state,
    requestBreeding,
    approveBreeding,
    executeBreeding,
    reset,
  };
}

export default useBreedingFlow;
