// src/components/RequestBreedingModal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Dna, Send, MessageSquare, User, Sparkles, AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";

interface Agent {
  id: string;
  name: string;
  fitness: number;
  generation: number;
  ownerDisplay?: string;
  traits?: Record<string, number>;
}

interface RequestBreedingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAgent: Agent | null;
  myAgents: Agent[];
  getAccessToken: () => Promise<string | null>;
  onSuccess?: () => void;
}

export function RequestBreedingModal({
  isOpen,
  onClose,
  targetAgent,
  myAgents,
  getAccessToken,
  onSuccess,
}: RequestBreedingModalProps) {
  const [selectedMyAgent, setSelectedMyAgent] = useState<Agent | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMyAgent(myAgents[0] || null);
      setMessage("");
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, myAgents]);

  const handleSubmit = async () => {
    if (!targetAgent || !selectedMyAgent) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Por favor inicia sesión");
        return;
      }

      const res = await fetch("/api/breeding/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentAId: selectedMyAgent.id,
          parentBId: targetAgent.id,
          crossoverType: "weighted",
          message: message || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al enviar solicitud");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !targetAgent) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md rounded-2xl p-6 overflow-hidden"
          style={{ backgroundColor: "var(--color-bg-secondary)" }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "var(--color-bg-tertiary)" }}
          >
            <X className="w-5 h-5" style={{ color: "var(--color-text-muted)" }} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-accent-1))" }}
            >
              <Dna className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                Solicitar Breeding
              </h2>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                con {targetAgent.name}
              </p>
            </div>
          </div>

          {success ? (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}
              >
                <Check className="w-8 h-8" style={{ color: "var(--color-success)" }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
                ¡Solicitud Enviada!
              </h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {targetAgent.ownerDisplay} recibirá tu solicitud
              </p>
            </motion.div>
          ) : (
            <>
              {/* Target Agent Info */}
              <div
                className="p-4 rounded-xl mb-4"
                style={{ backgroundColor: "var(--color-bg-tertiary)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>
                      Agente de {targetAgent.ownerDisplay || "otro usuario"}
                    </p>
                    <p className="font-bold" style={{ color: "var(--color-text-primary)" }}>
                      {targetAgent.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                      {targetAgent.fitness?.toFixed(1)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      Gen {targetAgent.generation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Select My Agent */}
              <div className="mb-4">
                <label className="text-xs font-medium mb-2 block" style={{ color: "var(--color-text-muted)" }}>
                  TU AGENTE
                </label>
                <select
                  value={selectedMyAgent?.id || ""}
                  onChange={(e) => {
                    const agent = myAgents.find((a) => a.id === e.target.value);
                    setSelectedMyAgent(agent || null);
                  }}
                  className="w-full p-3 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: "var(--color-bg-primary)",
                    border: "2px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {myAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} (Fitness: {agent.fitness?.toFixed(1)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                  <MessageSquare className="w-3 h-3" />
                  MENSAJE (opcional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe un mensaje para el dueño del agente..."
                  rows={3}
                  className="w-full p-3 rounded-xl text-sm outline-none resize-none"
                  style={{
                    backgroundColor: "var(--color-bg-primary)",
                    border: "2px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* Info */}
              <div
                className="p-3 rounded-lg mb-4 flex items-start gap-2"
                style={{ backgroundColor: "rgba(123, 63, 228, 0.1)" }}
              >
                <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  Al enviar, {targetAgent.ownerDisplay || "el dueño"} recibirá una notificación. 
                  Si acepta, se creará un nuevo agente con 50% custodia para cada uno.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="p-3 rounded-lg mb-4 flex items-center gap-2"
                  style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                >
                  <AlertCircle className="w-4 h-4" style={{ color: "var(--color-error)" }} />
                  <p className="text-sm" style={{ color: "var(--color-error)" }}>{error}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={loading || !selectedMyAgent}
                variant="primary"
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Solicitar Breeding
                  </>
                )}
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default RequestBreedingModal;
