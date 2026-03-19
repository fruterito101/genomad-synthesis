// src/hooks/useGenomadNFT.ts
"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useNetwork } from "@/contexts/NetworkContext";
import { GENOMAD_NFT_ABI } from "@/lib/blockchain/contracts";
import { type Address } from "viem";

// ============================================
// useRegisterAgent
// Registra un nuevo agente on-chain
// ============================================
export function useRegisterAgent() {
  const { contracts } = useNetwork();
  const address = contracts.genomadNFT as Address;

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
    if (!address) throw new Error("GenomadNFT not configured");
    
    writeContract({
      address,
      abi: GENOMAD_NFT_ABI,
      functionName: "registerAgent",
      args: [dnaCommitment],
    });
  };

  const registerAsync = async (dnaCommitment: `0x${string}`) => {
    if (!address) throw new Error("GenomadNFT not configured");
    
    return writeContractAsync({
      address,
      abi: GENOMAD_NFT_ABI,
      functionName: "registerAgent",
      args: [dnaCommitment],
    });
  };

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
// useActivateAgent
// Activa un agente (cambia isActive a true)
// ============================================
export function useActivateAgent() {
  const { contracts } = useNetwork();
  const address = contracts.genomadNFT as Address;

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
    if (!address) throw new Error("GenomadNFT not configured");
    
    writeContract({
      address,
      abi: GENOMAD_NFT_ABI,
      functionName: "activateAgent",
      args: [tokenId],
    });
  };

  const activateAsync = async (tokenId: bigint) => {
    if (!address) throw new Error("GenomadNFT not configured");
    
    return writeContractAsync({
      address,
      abi: GENOMAD_NFT_ABI,
      functionName: "activateAgent",
      args: [tokenId],
    });
  };

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
// useDeactivateAgent
// Desactiva un agente (cambia isActive a false)
// ============================================
export function useDeactivateAgent() {
  const { contracts } = useNetwork();
  const address = contracts.genomadNFT as Address;

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
    if (!address) throw new Error("GenomadNFT not configured");
    
    writeContract({
      address,
      abi: GENOMAD_NFT_ABI,
      functionName: "deactivateAgent",
      args: [tokenId],
    });
  };

  const deactivateAsync = async (tokenId: bigint) => {
    if (!address) throw new Error("GenomadNFT not configured");
    
    return writeContractAsync({
      address,
      abi: GENOMAD_NFT_ABI,
      functionName: "deactivateAgent",
      args: [tokenId],
    });
  };

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
// useTransferAgent
// Transfiere un agente a otra wallet
// ============================================
export function useTransferAgent() {
  const { contracts } = useNetwork();
  const address = contracts.genomadNFT as Address;

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
    if (!address) throw new Error("GenomadNFT not configured");
    
    writeContract({
      address,
      abi: GENOMAD_NFT_ABI,
      functionName: "transferFrom",
      args: [from, to, tokenId],
    });
  };

  const transferAsync = async (from: Address, to: Address, tokenId: bigint) => {
    if (!address) throw new Error("GenomadNFT not configured");
    
    return writeContractAsync({
      address,
      abi: GENOMAD_NFT_ABI,
      functionName: "transferFrom",
      args: [from, to, tokenId],
    });
  };

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
