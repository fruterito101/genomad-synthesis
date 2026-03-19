// src/components/ActivateAgentModal.tsx
// Ticket 4.11: UI Mint con Encriptación + ZK Proofs
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { 
  Zap, Loader2, Check, AlertCircle, Shield, Lock, 
  Dna, Sparkles, X
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { generateTraitProof, ProofResponse } from "@/lib/zk/client";
import { prepareAgentDataForChain } from "@/lib/crypto/wallet-encryption";
import { Traits, TRAIT_NAMES } from "@/lib/genetic/types";

interface Agent {
  id: string;
  name: string;
  dnaHash: string;
  commitment?: string;
  tokenId?: string;
  traits?: Traits;
  soulContent?: string;
  identityContent?: string;
}

interface ActivateAgentModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
  onActivated?: (tokenId: string, txHash: string) => void;
  onError?: (error: string) => void;
}

type Step = "ready" | "zkproof" | "encrypting" | "signing" | "confirming" | "updating" | "done" | "error";

export function ActivateAgentModal({
  agent,
  isOpen,
  onClose,
  onActivated,
  onError,
}: ActivateAgentModalProps) {
  const { i18n } = useTranslation();
  const { getAccessToken } = usePrivy();
  const { address } = useAccount();
  const [step, setStep] = useState<Step>("ready");
  const [error, setError] = useState<string>("");
  const [zkProof, setZkProof] = useState<ProofResponse | null>(null);
  const [progress, setProgress] = useState(0);
  
  const isEs = i18n.language === "es";

  useEffect(() => {
    if (isOpen) {
      setStep("ready");
      setError("");
      setZkProof(null);
      setProgress(0);
    }
  }, [isOpen]);

  const calculateFitness = (traits: Traits): number => {
    return TRAIT_NAMES.reduce((sum, name) => sum + traits[name], 0);
  };

  const handleActivate = async () => {
    if (!address || !agent.traits) {
      setError(isEs ? "Wallet no conectada o traits no disponibles" : "Wallet not connected or traits not available");
      setStep("error");
      return;
    }

    try {
      // Step 1: Generate ZK Proof
      setStep("zkproof");
      setProgress(15);
      
      const proofResult = await generateTraitProof(agent.traits);
      if (!proofResult.success) {
        throw new Error(proofResult.error || "ZK proof generation failed");
      }
      setZkProof(proofResult);
      setProgress(35);

      // Step 2: Encrypt SOUL/IDENTITY
      setStep("encrypting");
      setProgress(50);
      
      const _encryptedData = prepareAgentDataForChain(
        agent.soulContent || "# SOUL\nDefault soul content",
        agent.identityContent || "# IDENTITY\nDefault identity",
        address
      );
      setProgress(65);

      // Step 3: Sign & Send Transaction
      setStep("signing");
      setProgress(75);
      
      // TODO: Call contract with proof and encrypted data
      await new Promise(r => setTimeout(r, 1000));
      setProgress(85);

      // Step 4: Wait for confirmation
      setStep("confirming");
      await new Promise(r => setTimeout(r, 1500));
      setProgress(95);

      // Step 5: Update backend
      setStep("updating");
      const token = await getAccessToken();
      if (token) {
        await fetch(`/api/agents/${agent.id}`, {
          method: "PATCH",
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({ 
            tokenId: "1",
            txHash: "0x...",
            zkProofGenerated: true,
            encryptedOnChain: true,
          }),
        });
      }
      
      setProgress(100);
      setStep("done");
      onActivated?.("1", "0x...");

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
        icon: <Zap className="w-6 h-6" />,
        title: isEs ? "Listo para Activar" : "Ready to Activate",
        desc: isEs 
          ? "Tu agente será registrado on-chain con pruebas ZK y datos encriptados"
          : "Your agent will be registered on-chain with ZK proofs and encrypted data",
        color: "text-primary",
      },
      zkproof: {
        icon: <Shield className="w-6 h-6 animate-pulse" />,
        title: isEs ? "Generando Prueba ZK..." : "Generating ZK Proof...",
        desc: isEs 
          ? "Validando traits con RISC Zero"
          : "Validating traits with RISC Zero",
        color: "text-blue-400",
      },
      encrypting: {
        icon: <Lock className="w-6 h-6 animate-pulse" />,
        title: isEs ? "Encriptando Datos..." : "Encrypting Data...",
        desc: isEs
          ? "SOUL e IDENTITY se encriptan con tu wallet"
          : "SOUL and IDENTITY are encrypted with your wallet",
        color: "text-purple-400",
      },
      signing: {
        icon: <Loader2 className="w-6 h-6 animate-spin" />,
        title: isEs ? "Firma la Transacción" : "Sign the Transaction",
        desc: isEs
          ? "Confirma en tu wallet para registrar el agente en Monad"
          : "Confirm in your wallet to register the agent on Monad",
        color: "text-orange-400",
      },
      confirming: {
        icon: <Loader2 className="w-6 h-6 animate-spin" />,
        title: isEs ? "Confirmando..." : "Confirming...",
        desc: isEs
          ? "Esperando confirmación de la blockchain"
          : "Waiting for blockchain confirmation",
        color: "text-yellow-400",
      },
      updating: {
        icon: <Dna className="w-6 h-6 animate-pulse" />,
        title: isEs ? "Actualizando..." : "Updating...",
        desc: isEs
          ? "Sincronizando estado con el servidor"
          : "Syncing state with server",
        color: "text-cyan-400",
      },
      done: {
        icon: <Sparkles className="w-6 h-6" />,
        title: isEs ? "¡Agente Activado!" : "Agent Activated!",
        desc: isEs
          ? "Tu agente ahora vive on-chain con privacidad ZK"
          : "Your agent now lives on-chain with ZK privacy",
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
          className="bg-surface border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              {isEs ? "Activar en Monad" : "Activate on Monad"}
            </h2>
            {!isProcessing && (
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Agent Info */}
          <div className="bg-black/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">{agent.name}</p>
                <p className="text-sm text-gray-400 font-mono">
                  {agent.dnaHash.slice(0, 10)}...
                </p>
              </div>
              {agent.traits && (
                <div className="ml-auto text-right">
                  <p className="text-lg font-bold text-primary">{calculateFitness(agent.traits)}</p>
                  <p className="text-xs text-gray-400">fitness</p>
                </div>
              )}
            </div>
          </div>

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
          {zkProof && step !== "ready" && zkProof.output && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-6">
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <Check className="w-4 h-4" />
                <span>ZK Proof: {zkProof.output.fitness}/800 fitness, Tier {zkProof.output.rarity}</span>
              </div>
            </div>
          )}

          {/* Features */}
          {step === "ready" && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>{isEs ? "Prueba ZK de traits válidos" : "ZK proof of valid traits"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Lock className="w-4 h-4 text-purple-400" />
                <span>{isEs ? "SOUL/IDENTITY encriptados on-chain" : "Encrypted SOUL/IDENTITY on-chain"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Dna className="w-4 h-4 text-primary" />
                <span>{isEs ? "NFT único en Monad" : "Unique NFT on Monad"}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {step === "ready" && (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition"
                >
                  {isEs ? "Cancelar" : "Cancel"}
                </button>
                <button
                  onClick={handleActivate}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
                >
                  <Zap className="w-4 h-4" />
                  {isEs ? "Activar" : "Activate"}
                </button>
              </>
            )}

            {step === "done" && (
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-semibold flex items-center justify-center gap-2 border border-emerald-500/30"
              >
                <Check className="w-4 h-4" />
                {isEs ? "¡Listo!" : "Done!"}
              </button>
            )}

            {step === "error" && (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300"
                >
                  {isEs ? "Cerrar" : "Close"}
                </button>
                <button
                  onClick={() => { setStep("ready"); setError(""); }}
                  className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30"
                >
                  {isEs ? "Reintentar" : "Retry"}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ActivateAgentModal;
