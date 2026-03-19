// src/hooks/useGenomadNFT.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useNetwork } from "@/contexts/NetworkContext";
import { GENOMAD_NFT_ABI } from "@/lib/blockchain/contracts";
import { type Address, encodeFunctionData } from "viem";

// ============================================
// useRegisterAgent (usando Privy wallet)
// Registra un nuevo agente on-chain
// ============================================
export function useRegisterAgent() {
  const [isMounted, setIsMounted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<string | undefined>();
  
  const { contracts, chain } = useNetwork();
  const { wallets } = useWallets();
  const { ready } = usePrivy();
  
  const address = contracts.genomadNFT as Address;

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const reset = useCallback(() => {
    setIsPending(false);
    setIsConfirming(false);
    setIsSuccess(false);
    setIsError(false);
    setError(null);
    setHash(undefined);
  }, []);

  const registerAsync = useCallback(async (dnaCommitment: `0x${string}`) => {
    if (!isMounted || !address || !ready) {
      throw new Error("Not ready");
    }
    
    // Encontrar la wallet de Privy (embedded o la primera disponible)
    const embeddedWallet = wallets.find(w => w.walletClientType === "privy");
    const wallet = embeddedWallet || wallets[0];
    
    if (!wallet) {
      throw new Error("No wallet found. Please connect a wallet.");
    }
    
    try {
      setIsPending(true);
      setIsError(false);
      setError(null);
      
      // Obtener el provider de la wallet
      const provider = await wallet.getEthereumProvider();
      
      // Asegurar que estamos en la red correcta
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chain.id.toString(16)}` }],
        });
      } catch (switchError: any) {
        // Si la red no existe, agregarla
        if (switchError.code === 4902) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: `0x${chain.id.toString(16)}`,
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: [chain.rpcUrls.default.http[0]],
              blockExplorerUrls: chain.blockExplorers?.default?.url ? [chain.blockExplorers.default.url] : undefined,
            }],
          });
        }
      }
      
      // Encode function data
      const data = encodeFunctionData({
        abi: GENOMAD_NFT_ABI,
        functionName: "registerAgent",
        args: [dnaCommitment],
      });
      
      // Enviar transacción usando el provider de Privy
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [{
          from: wallet.address,
          to: address,
          data,
        }],
      });
      
      setHash(txHash);
      setIsPending(false);
      setIsConfirming(true);
      
      // Esperar receipt y obtener tokenId del evento Transfer
      let tokenId: string | undefined;
      let attempts = 0;
      const maxAttempts = 30; // 30 intentos x 2s = 60s máximo
      
      while (attempts < maxAttempts) {
        try {
          const receipt = await provider.request({
            method: "eth_getTransactionReceipt",
            params: [txHash],
          }) as any;
          
          if (receipt && receipt.status === "0x1") {
            // Buscar evento Transfer (ERC721): Transfer(address,address,uint256)
            const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
            const transferLog = receipt.logs?.find((log: any) => 
              log.topics?.[0] === transferTopic
            );
            
            if (transferLog && transferLog.topics?.[3]) {
              tokenId = parseInt(transferLog.topics[3], 16).toString();
            }
            break;
          } else if (receipt && receipt.status === "0x0") {
            throw new Error("Transaction failed on-chain");
          }
        } catch (e) {
          // Receipt not ready yet, continue polling
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (!tokenId && attempts >= maxAttempts) {
        console.warn("Could not get tokenId from receipt, transaction may still be pending");
      }
      
      setIsConfirming(false);
      setIsSuccess(true);
      
      return { txHash, tokenId };
      
    } catch (err) {
      console.error("Registration error:", err);
      setIsPending(false);
      setIsConfirming(false);
      setIsError(true);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [isMounted, address, ready, wallets, chain]);

  const register = useCallback((dnaCommitment: `0x${string}`) => {
    registerAsync(dnaCommitment).catch(console.error);
  }, [registerAsync]);

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
      reset,
    };
  }

  return {
    register,
    registerAsync,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
    reset,
  };
}

// ============================================
// useBreedAgents (placeholder - agregar después)
// ============================================
export function useBreedAgents() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return {
    breed: () => {},
    breedAsync: async () => { throw new Error("Not implemented"); },
    isPending: false,
    isConfirming: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: () => {},
  };
}

// ============================================
// useActivateAgent (alias de useRegisterAgent)
// ============================================
export const useActivateAgent = useRegisterAgent;
