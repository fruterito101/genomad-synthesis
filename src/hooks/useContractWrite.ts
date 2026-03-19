// src/hooks/useContractWrite.ts
"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useNetwork } from "@/contexts/NetworkContext";
import { type Abi, type Address } from "viem";

export interface ContractWriteResult {
  write: () => void;
  writeAsync: () => Promise<`0x${string}`>;
  hash: `0x${string}` | undefined;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
}

interface UseContractWriteOptions {
  contractKey: "genomadNFT" | "breedingFactory" | "gmdToken";
  abi: Abi;
  functionName: string;
  args?: unknown[];
  value?: bigint;
  onSuccess?: (hash: `0x${string}`) => void;
  onError?: (error: Error) => void;
}

export function useContractWrite({
  contractKey,
  abi,
  functionName,
  args = [],
  value,
  onSuccess,
  onError,
}: UseContractWriteOptions): ContractWriteResult {
  const { contracts } = useNetwork();
  const address = contracts[contractKey] as Address;

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
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
  });

  const error = writeError || receiptError;

  const write = () => {
    if (!address) {
      onError?.(new Error(`Contract ${contractKey} not configured for this network`));
      return;
    }

    writeContract(
      {
        address,
        abi,
        functionName,
        args,
        value,
      },
      {
        onSuccess: (hash) => {
          onSuccess?.(hash);
        },
        onError: (err) => {
          onError?.(err);
        },
      }
    );
  };

  const writeAsync = async (): Promise<`0x${string}`> => {
    if (!address) {
      throw new Error(`Contract ${contractKey} not configured for this network`);
    }

    return writeContractAsync({
      address,
      abi,
      functionName,
      args,
      value,
    });
  };

  return {
    write,
    writeAsync,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!error,
    error: error as Error | null,
    reset,
  };
}
