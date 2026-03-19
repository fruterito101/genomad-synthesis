// src/hooks/useGenomadNFT.ts
"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useNetwork } from "@/contexts/NetworkContext";
import { GENOMAD_NFT_ABI } from "@/lib/blockchain/contracts";
import { type Address } from "viem";

// ============================================
// useRegisterAgent (SSR-safe)
// Registra un nuevo agente on-chain
// ============================================
export function useRegisterAgent() {
  const [isMounted, setIsMounted] = useState(false);
  const { contracts } = useNetwork();
  const address = contracts.genomadNFT as Address;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    writeContract,
    writeContractAsync,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const register = (dnaCommitment: `0x${string}`) => {
    if (!isMounted || !address) return;
    
    writeContract({
      address,
      abi: GENOMAD_NFT_ABI,
      functionName: "registerAgent",
      args: [dnaCommitment],
    });
  };

  const registerAsync = async (dnaCommitment: `0x${string}`) => {
    if (!isMounted || !address) throw new Error("Not ready");
    
    return writeContractAsync({
      address,
      abi: GENOMAD_NFT_ABI,
      functionName: "registerAgent",
      args: [dnaCommitment],
    });
  };

  if (!isMounted) {
    return {
      register: () => {},
      registerAsync: async () => { throw new Error("Not mounted"); },
      hash: undefined,
      isPending: false,
      isConfirming: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: () => {},
    };
  }

  return {
    register,
    registerAsync,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!(writeError || receiptError),
    error: writeError || receiptError,
    reset,
  };
}

// ============================================
// useActivateAgent (SSR-safe)
// ============================================
export function useActivateAgent() {
  const [isMounted, setIsMounted] = useState(false);
  const { contracts } = useNetwork();
  const address = contracts.genomadNFT as Address;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    writeContract,
    writeContractAsync,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const activate = (tokenId: bigint) => {
    if (!isMounted || !address) return;
    
    writeContract({
      address,
      abi: GENOMAD_NFT_ABI,
      functionName: "activateAgent",
      args: [tokenId],
    });
  };

  const activateAsync = async (tokenId: bigint) => {
    if (!isMounted || !address) throw new Error("Not ready");
    
    return writeContractAsync({
      address,
      abi: GENOMAD_NFT_ABI,
      functionName: "activateAgent",
      args: [tokenId],
    });
  };

  if (!isMounted) {
    return {
      activate: () => {},
      activateAsync: async () => { throw new Error("Not mounted"); },
      hash: undefined,
      isPending: false,
      isConfirming: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: () => {},
    };
  }

  return {
    activate,
    activateAsync,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!(writeError || receiptError),
    error: writeError || receiptError,
    reset,
  };
}

// ============================================
// useDeactivateAgent (SSR-safe)
// ============================================
export function useDeactivateAgent() {
  const [isMounted, setIsMounted] = useState(false);
  const { contracts } = useNetwork();
  const address = contracts.genomadNFT as Address;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    writeContract,
    writeContractAsync,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const deactivate = (tokenId: bigint) => {
    if (!isMounted || !address) return;
    
    writeContract({
      address,
      abi: GENOMAD_NFT_ABI,
      functionName: "deactivateAgent",
      args: [tokenId],
    });
  };

  const deactivateAsync = async (tokenId: bigint) => {
    if (!isMounted || !address) throw new Error("Not ready");
    
    return writeContractAsync({
      address,
      abi: GENOMAD_NFT_ABI,
      functionName: "deactivateAgent",
      args: [tokenId],
    });
  };

  if (!isMounted) {
    return {
      deactivate: () => {},
      deactivateAsync: async () => { throw new Error("Not mounted"); },
      hash: undefined,
      isPending: false,
      isConfirming: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: () => {},
    };
  }

  return {
    deactivate,
    deactivateAsync,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!(writeError || receiptError),
    error: writeError || receiptError,
    reset,
  };
}

// ============================================
// useTransferAgent (SSR-safe)
// ============================================
export function useTransferAgent() {
  const [isMounted, setIsMounted] = useState(false);
  const { contracts } = useNetwork();
  const address = contracts.genomadNFT as Address;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    writeContract,
    writeContractAsync,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const transfer = (from: Address, to: Address, tokenId: bigint) => {
    if (!isMounted || !address) return;
    
    writeContract({
      address,
      abi: GENOMAD_NFT_ABI,
      functionName: "transferFrom",
      args: [from, to, tokenId],
    });
  };

  const transferAsync = async (from: Address, to: Address, tokenId: bigint) => {
    if (!isMounted || !address) throw new Error("Not ready");
    
    return writeContractAsync({
      address,
      abi: GENOMAD_NFT_ABI,
      functionName: "transferFrom",
      args: [from, to, tokenId],
    });
  };

  if (!isMounted) {
    return {
      transfer: () => {},
      transferAsync: async () => { throw new Error("Not mounted"); },
      hash: undefined,
      isPending: false,
      isConfirming: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: () => {},
    };
  }

  return {
    transfer,
    transferAsync,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!(writeError || receiptError),
    error: writeError || receiptError,
    reset,
  };
}
