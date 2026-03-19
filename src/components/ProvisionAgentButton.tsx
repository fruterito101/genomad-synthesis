// src/components/ProvisionAgentButton.tsx
// Provision agent to OpenClaw via relay or local
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { 
  Terminal, Loader2, Check, AlertCircle, Wifi, WifiOff,
  Play, ExternalLink
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface Agent {
  id: string;
  name: string;
  isActive?: boolean;
  tokenId?: string | null;
}

interface ProvisionAgentButtonProps {
  agent: Agent;
  onProvisioned?: () => void;
  onError?: (error: string) => void;
  className?: string;
  showStatus?: boolean;
}

type Status = "idle" | "checking" | "provisioning" | "done" | "error" | "no-connection";

export function ProvisionAgentButton({
  agent,
  onProvisioned,
  onError,
  className = "",
  showStatus = true,
}: ProvisionAgentButtonProps) {
  const { i18n } = useTranslation();
  const { user, getAccessToken } = usePrivy();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [relayConnected, setRelayConnected] = useState<boolean | null>(null);
  const [activationMethod, setActivationMethod] = useState<string>("");
  
  const isEs = i18n.language === "es";
  const userId = user?.id;

  // Check relay connection on mount
  useEffect(() => {
    if (!userId) return;
    
    const checkRelay = async () => {
      try {
        const response = await fetch(`/api/relay?userId=${userId}`);
        const data = await response.json();
        setRelayConnected(data.connected || false);
      } catch {
        setRelayConnected(false);
      }
    };
    
    checkRelay();
    const interval = setInterval(checkRelay, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Already provisioned
  if (agent.isActive) {
    if (!showStatus) return null;
    return (
      <div className={`flex items-center gap-2 text-emerald-500 ${className}`}>
        <Check className="w-4 h-4" />
        <span className="text-sm">{isEs ? "Corriendo" : "Running"}</span>
      </div>
    );
  }

  const handleProvision = async () => {
    if (!userId) {
      setError(isEs ? "Inicia sesión primero" : "Please login first");
      setStatus("error");
      return;
    }

    try {
      setStatus("checking");
      
      // Get access token
      const token = await getAccessToken();
      if (!token) {
        throw new Error(isEs ? "No se pudo obtener token" : "Could not get access token");
      }

      setStatus("provisioning");

      // Call activate API with userId
      const response = await fetch(`/api/agents/${agent.id}/activate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "NO_CONNECTION") {
          setStatus("no-connection");
          return;
        }
        throw new Error(data.error || "Activation failed");
      }

      setActivationMethod(data.activationMethod || "unknown");
      setStatus("done");
      onProvisioned?.();

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      setStatus("error");
      onError?.(errorMsg);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case "checking":
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isEs ? "Verificando..." : "Checking..."}
          </>
        );
      case "provisioning":
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isEs ? "Iniciando..." : "Starting..."}
          </>
        );
      case "done":
        return (
          <>
            <Check className="w-4 h-4" />
            {activationMethod === "relay" 
              ? (isEs ? "¡Enviado!" : "Sent!")
              : (isEs ? "¡Activo!" : "Active!")
            }
          </>
        );
      case "no-connection":
        return (
          <>
            <WifiOff className="w-4 h-4" />
            {isEs ? "Sin conexión" : "No connection"}
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
            {relayConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <Terminal className="w-4 h-4" />
            )}
            {isEs ? "Correr Agente" : "Run Agent"}
          </>
        );
    }
  };

  const isDisabled = status === "checking" || status === "provisioning";
  
  // No connection state - show instructions
  if (status === "no-connection") {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2 text-amber-400 text-sm">
          <WifiOff className="w-4 h-4" />
          {isEs ? "Conecta tu OpenClaw" : "Connect your OpenClaw"}
        </div>
        <p className="text-xs text-gray-400">
          {isEs 
            ? "Ve a tu perfil para ver las instrucciones de conexión."
            : "Go to your profile to see connection instructions."}
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-xs text-primary hover:underline"
        >
          {isEs ? "Reintentar" : "Try again"}
        </button>
      </div>
    );
  }

  return (
    <motion.button
      onClick={handleProvision}
      disabled={isDisabled}
      className={`
        flex items-center justify-center gap-2 rounded-lg font-medium
        px-4 py-2 transition-all duration-200
        ${status === "done" 
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
          : status === "error"
          ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
          : relayConnected
          ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
          : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
        }
        ${isDisabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      title={relayConnected 
        ? (isEs ? "Conectado via relay" : "Connected via relay")
        : (isEs ? "OpenClaw local o relay desconectado" : "Local OpenClaw or relay disconnected")
      }
    >
      {getButtonContent()}
    </motion.button>
  );
}

export default ProvisionAgentButton;
