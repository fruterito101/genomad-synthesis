// src/components/RequestBreedingModal.tsx
// Modal para solicitar breeding - Migrado a shadcn Dialog

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dna, Send, MessageSquare, Sparkles, AlertCircle, Check, Loader2 } from "lucide-react";
import { 
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Label,
  Textarea,
} from "@/components/ui";

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

  if (!targetAgent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-accent">
              <Dna className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle>Solicitar Breeding</DialogTitle>
              <DialogDescription>con {targetAgent.name}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {success ? (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-500/10">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">
              ¡Solicitud Enviada!
            </h3>
            <p className="text-sm text-muted-foreground">
              {targetAgent.ownerDisplay} recibirá tu solicitud
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Target Agent Info */}
            <div className="p-4 rounded-xl bg-muted">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs mb-1 text-muted-foreground">
                    Agente de {targetAgent.ownerDisplay || "otro usuario"}
                  </p>
                  <p className="font-bold">{targetAgent.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {targetAgent.fitness?.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Gen {targetAgent.generation}
                  </p>
                </div>
              </div>
            </div>

            {/* Select My Agent */}
            <div className="space-y-2">
              <Label className="text-xs">TU AGENTE</Label>
              <select
                value={selectedMyAgent?.id || ""}
                onChange={(e) => {
                  const agent = myAgents.find((a) => a.id === e.target.value);
                  setSelectedMyAgent(agent || null);
                }}
                className="w-full p-3 rounded-md text-sm outline-none bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring"
              >
                {myAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} (Fitness: {agent.fitness?.toFixed(1)})
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                MENSAJE (opcional)
              </Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe un mensaje para el dueño del agente..."
                rows={3}
              />
            </div>

            {/* Info */}
            <div className="p-3 rounded-lg bg-primary/10 flex items-start gap-2">
              <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
              <p className="text-xs text-muted-foreground">
                Al enviar, {targetAgent.ownerDisplay || "el dueño"} recibirá una notificación. 
                Si acepta, se creará un nuevo agente con 50% custodia para cada uno.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !selectedMyAgent}
              className="w-full"
              size="lg"
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default RequestBreedingModal;
