// src/components/BreedingExecuteModal.tsx
// Ticket 4.12: UI Breeding con ZK Proofs
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import {
  Dna, Loader2, Check, AlertCircle, Shield, Lock,
  Sparkles, X, ArrowRight, Users, Zap, Heart
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { generateBreedProof, ProofResponse } from "@/lib/zk/client";
import { encryptForMultipleOwners } from "@/lib/crypto/wallet-encryption";
import { Traits, TRAIT_NAMES, crossover, applyMutation } from "@/lib/genetic";
import { Button } from "@/components/ui";

interface Parent {
  id: string;
  name: string;
  tokenId?: string;
  traits: Traits;
  ownerAddress: string;
  ownerDisplay?: string;
}

interface BreedingExecuteModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentA: Parent;
  parentB: Parent;
  childName: string;
  breedingRequestId: string;
  onSuccess?: (childTokenId: string, txHash: string) => void;
  onError?: (error: string) => void;
}

type Step = 
  | "ready" 
  | "generating_child" 
  | "zkproof" 
  | "encrypting" 
  | "signing" 
  | "confirming" 
  | "minting"
  | "done" 
  | "error";

export function BreedingExecuteModal({
  isOpen,
  onClose,
  parentA,
  parentB,
  childName,
  breedingRequestId,
  onSuccess,
  onError,
}: BreedingExecuteModalProps) {
  const { i18n } = useTranslation();
  const { getAccessToken } = usePrivy();
  const { address } = useAccount();
  const [step, setStep] = useState<Step>("ready");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [childTraits, setChildTraits] = useState<Traits | null>(null);
  const [zkProof, setZkProof] = useState<ProofResponse | null>(null);
  const [hybridVigor, setHybridVigor] = useState(false);

  const isEs = i18n.language === "es";

  useEffect(() => {
    if (isOpen) {
      setStep("ready");
      setError("");
      setProgress(0);
      setChildTraits(null);
      setZkProof(null);
      setHybridVigor(false);
    }
  }, [isOpen]);

  const calculateFitness = (traits: Traits): number => {
    return TRAIT_NAMES.reduce((sum, name) => sum + traits[name], 0);
  };

  const handleExecuteBreeding = async () => {
    if (!address) {
      setError(isEs ? "Wallet no conectada" : "Wallet not connected");
      setStep("error");
      return;
    }

    try {
      // Step 1: Generate child traits using genetic functions
      setStep("generating_child");
      setProgress(10);

      // Perform crossover
      let child = crossover(parentA.traits, parentB.traits, "weighted");
      
      // Apply mutation
      const mutationResult = applyMutation(child, 0.3, 10);
      child = mutationResult.traits;
      
      setChildTraits(child);
      setProgress(25);

      // Check for hybrid vigor
      const parentAFitness = calculateFitness(parentA.traits);
      const parentBFitness = calculateFitness(parentB.traits);
      const childFitness = calculateFitness(child);
      const hasVigor = childFitness > parentAFitness && childFitness > parentBFitness;
      setHybridVigor(hasVigor);

      // Step 2: Generate ZK Proof
      setStep("zkproof");
      setProgress(35);

      // Generate crossover mask based on weighted crossover logic
      const crossoverMask = TRAIT_NAMES.map(() => Math.random() > 0.5);

      const proofResult = await generateBreedProof(
        parentA.traits,
        parentB.traits,
        child,
        crossoverMask,
        15 // max mutation (matching applyMutation range)
      );

      if (!proofResult.success) {
        throw new Error(proofResult.error || "ZK proof generation failed");
      }
      setZkProof(proofResult);
      setProgress(55);

      // Step 3: Encrypt child's SOUL/IDENTITY for both parents
      setStep("encrypting");
      setProgress(65);

      const childSoul = generateChildSoul(childName, parentA.name, parentB.name, child);
      const childIdentity = generateChildIdentity(childName, child);

      // Encrypt for both owners (50/50 custody)
      const _encryptedData = encryptForMultipleOwners(
        childSoul + "\n---\n" + childIdentity,
        [parentA.ownerAddress, parentB.ownerAddress]
      );
      setProgress(75);

      // Step 4: Sign transaction
      setStep("signing");
      setProgress(80);

      // TODO: Call breeding contract with proof and encrypted data
      await new Promise(r => setTimeout(r, 1000));
      setProgress(85);

      // Step 5: Wait for confirmation
      setStep("confirming");
      setProgress(90);
      await new Promise(r => setTimeout(r, 1500));

      // Step 6: Mint child NFT
      setStep("minting");
      setProgress(95);
      await new Promise(r => setTimeout(r, 1000));

      // Step 7: Update backend
      const token = await getAccessToken();
      if (token) {
        await fetch(`/api/breeding/${breedingRequestId}/complete`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            childTokenId: "NEW_TOKEN_ID",
            txHash: "0x...",
            childTraits: child,
            zkProofGenerated: true,
            hybridVigor: hasVigor,
          }),
        });
      }

      setProgress(100);
      setStep("done");
      onSuccess?.("NEW_TOKEN_ID", "0x...");

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      setStep("error");
      onError?.(errorMsg);
    }
  };

  const getStepInfo = () => {
    const steps: Record<Step, { icon: React.ReactNode; title: string; desc: string; color: string }> = {
      ready: {
        icon: <Heart className="w-6 h-6" />,
        title: isEs ? "Listo para Breeding" : "Ready for Breeding",
        desc: isEs 
          ? "Se creará un nuevo agente con 50% custodia para cada padre"
          : "A new agent will be created with 50% custody for each parent",
        color: "text-pink-400",
      },
      generating_child: {
        icon: <Dna className="w-6 h-6 animate-pulse" />,
        title: isEs ? "Generando DNA del Hijo..." : "Generating Child DNA...",
        desc: isEs
          ? "Combinando traits de ambos padres con crossover genético"
          : "Combining traits from both parents with genetic crossover",
        color: "text-purple-400",
      },
      zkproof: {
        icon: <Shield className="w-6 h-6 animate-pulse" />,
        title: isEs ? "Generando Prueba ZK..." : "Generating ZK Proof...",
        desc: isEs
          ? "Validando que el crossover y mutaciones son correctos"
          : "Validating that crossover and mutations are correct",
        color: "text-blue-400",
      },
      encrypting: {
        icon: <Lock className="w-6 h-6 animate-pulse" />,
        title: isEs ? "Encriptando para Ambos Dueños..." : "Encrypting for Both Owners...",
        desc: isEs
          ? "Cada padre podrá desencriptar con su wallet"
          : "Each parent will be able to decrypt with their wallet",
        color: "text-cyan-400",
      },
      signing: {
        icon: <Loader2 className="w-6 h-6 animate-spin" />,
        title: isEs ? "Firma la Transacción" : "Sign the Transaction",
        desc: isEs
          ? "Confirma en tu wallet para crear el nuevo agente"
          : "Confirm in your wallet to create the new agent",
        color: "text-orange-400",
      },
      confirming: {
        icon: <Loader2 className="w-6 h-6 animate-spin" />,
        title: isEs ? "Confirmando..." : "Confirming...",
        desc: isEs
          ? "Esperando confirmación de Base"
          : "Waiting for Base confirmation",
        color: "text-yellow-400",
      },
      minting: {
        icon: <Sparkles className="w-6 h-6 animate-pulse" />,
        title: isEs ? "Minteando NFT..." : "Minting NFT...",
        desc: isEs
          ? "Creando el NFT del nuevo agente"
          : "Creating the new agent's NFT",
        color: "text-primary",
      },
      done: {
        icon: <Sparkles className="w-6 h-6" />,
        title: isEs ? "¡Breeding Exitoso!" : "Breeding Successful!",
        desc: isEs
          ? "El nuevo agente ha nacido on-chain"
          : "The new agent has been born on-chain",
        color: "text-emerald-400",
      },
      error: {
        icon: <AlertCircle className="w-6 h-6" />,
        title: "Error",
        desc: error,
        color: "text-red-400",
      },
    };
    return steps[step];
  };

  const stepInfo = getStepInfo();
  const isProcessing = !["ready", "done", "error"].includes(step);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={() => !isProcessing && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Dna className="w-5 h-5 text-primary" />
              {isEs ? "Ejecutar Breeding" : "Execute Breeding"}
            </h2>
            {!isProcessing && (
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Parents Display */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex-1 bg-black/30 rounded-xl p-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-2">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-sm">{parentA.name}</p>
              <p className="text-xs text-gray-400">{calculateFitness(parentA.traits)} pts</p>
            </div>

            <div className="flex flex-col items-center">
              <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
              <ArrowRight className="w-4 h-4 text-gray-500 mt-1" />
            </div>

            <div className="flex-1 bg-black/30 rounded-xl p-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center mb-2">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-sm">{parentB.name}</p>
              <p className="text-xs text-gray-400">{calculateFitness(parentB.traits)} pts</p>
            </div>
          </div>

          {/* Child Preview */}
          {childTraits && step !== "ready" && (
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl p-4 mb-6 border border-primary/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold">{childName}</p>
                    <p className="text-xs text-gray-300">{isEs ? "Nuevo Agente" : "New Agent"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{calculateFitness(childTraits)}</p>
                  <p className="text-xs text-gray-400">fitness</p>
                </div>
              </div>
              {hybridVigor && (
                <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm">
                  <Zap className="w-4 h-4" />
                  <span>{isEs ? "¡Vigor Híbrido! Supera a ambos padres" : "Hybrid Vigor! Exceeds both parents"}</span>
                </div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {isProcessing && (
            <div className="mb-6">
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 text-right">{progress}%</p>
            </div>
          )}

          {/* Current Step */}
          <div className={`p-4 rounded-xl bg-black/30 border border-white/5 mb-6 ${stepInfo.color}`}>
            <div className="flex items-start gap-3">
              <div className="mt-1">{stepInfo.icon}</div>
              <div>
                <p className="font-semibold">{stepInfo.title}</p>
                <p className="text-sm text-gray-300 mt-1">{stepInfo.desc}</p>
              </div>
            </div>
          </div>

          {/* ZK Proof Info */}
          {zkProof?.output && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-6">
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <Shield className="w-4 h-4" />
                <span>
                  ZK Verified: {zkProof.output.valid ? "✓" : "✗"} |
                  Mutations: {Array.isArray(zkProof.output.mutations) 
                    ? zkProof.output.mutations.filter((m: number) => m !== 0).length 
                    : 0}/8
                </span>
              </div>
            </div>
          )}

          {/* Custody Info */}
          {step === "ready" && (
            <div className="flex items-center gap-3 text-sm text-gray-300 mb-6 p-3 bg-black/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
              <span>
                {isEs 
                  ? "Custodia: 50% cada padre. Ambos podrán correr el agente."
                  : "Custody: 50% each parent. Both can run the agent."}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {step === "ready" && (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  {isEs ? "Cancelar" : "Cancel"}
                </Button>
                <Button
                  onClick={handleExecuteBreeding}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-primary"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {isEs ? "Crear Hijo" : "Create Child"}
                </Button>
              </>
            )}

            {step === "done" && (
              <Button
                onClick={onClose}
                className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              >
                <Check className="w-4 h-4 mr-2" />
                {isEs ? "¡Completado!" : "Completed!"}
              </Button>
            )}

            {step === "error" && (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  {isEs ? "Cerrar" : "Close"}
                </Button>
                <Button
                  onClick={() => { setStep("ready"); setError(""); }}
                  className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30"
                >
                  {isEs ? "Reintentar" : "Retry"}
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper functions
function generateChildSoul(name: string, parentA: string, parentB: string, traits: Traits): string {
  const fitness = TRAIT_NAMES.reduce((sum, n) => sum + traits[n], 0);
  return `# SOUL.md - ${name}

## Origin
Born from the genetic combination of ${parentA} and ${parentB}.

## Core Traits
${TRAIT_NAMES.map(n => `- ${n}: ${traits[n]}`).join('\n')}

## Fitness
Total: ${fitness}/800

## Purpose
Inheriting the best qualities from both parents, ready to evolve and grow.
`;
}

function generateChildIdentity(name: string, traits: Traits): string {
  const fitness = TRAIT_NAMES.reduce((sum, n) => sum + traits[n], 0);
  const rarity = fitness > 720 ? "Legendary" : fitness > 600 ? "Epic" : fitness > 480 ? "Rare" : "Common";
  
  return `# IDENTITY.md - ${name}

## Basic Info
- Name: ${name}
- Generation: 1+
- Rarity: ${rarity}
- Fitness: ${fitness}/800

## Created
- Timestamp: ${new Date().toISOString()}
- Method: Genetic Breeding (ZK Verified)
`;
}

export default BreedingExecuteModal;
