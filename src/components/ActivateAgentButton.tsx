// src/components/ActivateAgentButton.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useRegisterAgent } from "@/hooks/useGenomadNFT";
import { useSwitchToBase } from "@/hooks/useSwitchToBase";
import { Zap, Loader2, Check, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Agent {
  id: string;
  name: string;
  dnaHash: string;
  commitment?: string;
  tokenId?: string;
}

interface ActivateAgentButtonProps {
  agent: Agent;
  onActivated?: (tokenId: string, txHash: string) => void;
  onError?: (error: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ActivateAgentButton({
  agent,
  onActivated,
  onError,
  className = "",
  size = "md",
}: ActivateAgentButtonProps) {
  const { i18n } = useTranslation();
  const { getAccessToken } = usePrivy();
  const { registerAsync, isPending, isConfirming, isSuccess, isError, error, hash, reset } = useRegisterAgent();
  const { isOnBase, ensureBase } = useSwitchToBase();
  const [status, setStatus] = useState<"idle" | "switching" | "signing" | "confirming" | "updating" | "done" | "error">("idle");
  const isEs = i18n.language === "es";

  // Si ya tiene tokenId, mostrar como activado
  if (agent.tokenId) {
    return (
      <div className={`flex items-center gap-2 text-emerald-500 ${className}`}>
        <Check className="w-4 h-4" />
        <span className="text-sm">{isEs ? "En Base" : "On Base"} #{agent.tokenId}</span>
      </div>
    );
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const handleActivate = async () => {
    try {
      // 1. Asegurar que estamos en Base
      if (!isOnBase) {
        setStatus("switching");
        await ensureBase();
      }
      
      setStatus("signing");
      
      // 2. Registrar on-chain
      const { txHash, tokenId } = await registerAsync();
      console.log("[ACTIVATION] Got result - txHash:", txHash, "tokenId:", tokenId);
      
      setStatus("confirming");
      
      // 3. Actualizar en nuestra API
      setStatus("updating");
      
      const token = await getAccessToken();
      if (token && tokenId) {
        console.log("[ACTIVATION] Saving tokenId:", tokenId);
        const patchRes = await fetch(`/api/agents/${agent.id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ txHash, tokenId }),
        });
        if (!patchRes.ok) console.error("[ACTIVATION] PATCH failed");
        else console.log("[ACTIVATION] ✅ Saved!");
      } else {
        console.warn("[ACTIVATION] ⚠️ No tokenId to save, will retry on page refresh");
      }
      
      setStatus("done");
      onActivated?.(tokenId || "", txHash || "");
      
    } catch (err: any) {
      console.error("[ACTIVATION] Error:", err);
      setStatus("error");
      const errorMsg = err?.shortMessage || err?.message || "Error activating agent";
      onError?.(errorMsg);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case "switching":
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isEs ? "Cambiando a Base..." : "Switching to Base..."}
          </>
        );
      case "signing":
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isEs ? "Firmando..." : "Signing..."}
          </>
        );
      case "confirming":
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isEs ? "Confirmando..." : "Confirming..."}
          </>
        );
      case "updating":
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isEs ? "Actualizando..." : "Updating..."}
          </>
        );
      case "done":
        return (
          <>
            <Check className="w-4 h-4" />
            {isEs ? "¡Activado!" : "Activated!"}
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle className="w-4 h-4" />
            {isEs ? "Reintentar" : "Retry"}
          </>
        );
      default:
        return (
          <>
            <Zap className="w-4 h-4" />
            {isEs ? "Activar en Base" : "Activate on Base"}
          </>
        );
    }
  };

  const isDisabled = status === "switching" || status === "signing" || status === "confirming" || status === "updating";
  
  return (
    <motion.button
      onClick={handleActivate}
      disabled={isDisabled}
      className={`
        flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-200
        ${sizeClasses[size]}
        ${status === "done" 
          ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" 
          : status === "error"
          ? "bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30"
          : "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
        }
        ${isDisabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
    >
      {getButtonContent()}
    </motion.button>
  );
}

export default ActivateAgentButton;
