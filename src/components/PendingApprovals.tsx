// src/components/PendingApprovals.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  Users, 
  Dna,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui";

interface Approval {
  id: string;
  agentId: string;
  actionType: "breeding" | "rename" | "transfer" | "deactivate";
  actionData: Record<string, any>;
  requiredPercentage: number;
  currentPercentage: number;
  approvedBy: string[];
  rejectedBy: string[];
  status: "pending" | "approved" | "rejected" | "executed" | "expired";
  expiresAt: string;
  createdAt: string;
  agent: {
    id: string;
    name: string;
    fitness: number;
    generation: number;
  } | null;
  userHasApproved: boolean;
  userHasRejected: boolean;
  requestorName?: string;
}

interface PendingApprovalsProps {
  getAccessToken: () => Promise<string | null>;
  onActionComplete?: () => void;
}

const ACTION_LABELS: Record<string, { es: string; en: string; icon: string }> = {
  breeding: { es: "Breeding", en: "Breeding", icon: "🧬" },
  rename: { es: "Renombrar", en: "Rename", icon: "✏️" },
  transfer: { es: "Transferir", en: "Transfer", icon: "📤" },
  deactivate: { es: "Desactivar", en: "Deactivate", icon: "⏸️" },
};

export function PendingApprovals({ getAccessToken, onActionComplete }: PendingApprovalsProps) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessToken();
      if (!token) return;

      const res = await fetch("/api/approvals", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch approvals");

      const data = await res.json();
      setApprovals(data.pending || []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleAction = async (approvalId: string, action: "approve" | "reject") => {
    try {
      setProcessingId(approvalId);
      const token = await getAccessToken();
      if (!token) return;

      const res = await fetch(`/api/approvals/${approvalId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process action");
      }

      // Refresh list
      await fetchApprovals();
      onActionComplete?.();
    } catch (err) {
      setError(String(err));
    } finally {
      setProcessingId(null);
    }
  };

  const formatTimeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expirado";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading && approvals.length === 0) {
    return (
      <div 
        className="rounded-xl p-4 sm:p-6 mb-6"
        style={{ backgroundColor: "var(--color-bg-secondary)" }}
      >
        <div className="flex items-center gap-2 animate-pulse">
          <Clock className="w-5 h-5" style={{ color: "var(--color-text-muted)" }} />
          <span style={{ color: "var(--color-text-muted)" }}>Cargando solicitudes...</span>
        </div>
      </div>
    );
  }

  if (approvals.length === 0) {
    return null; // No mostrar nada si no hay solicitudes
  }

  return (
    <motion.div
      className="rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 gradient-border"
      style={{ backgroundColor: "var(--color-bg-secondary)" }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-4 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" style={{ color: "#F59E0B" }} />
          <h2 
            className="text-lg font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Solicitudes Pendientes
          </h2>
          <span 
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              color: "#F59E0B" 
            }}
          >
            {approvals.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchApprovals();
            }}
            className="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "var(--color-bg-tertiary)" }}
          >
            <RefreshCw 
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              style={{ color: "var(--color-text-muted)" }}
            />
          </button>
          {expanded ? (
            <ChevronUp className="w-5 h-5" style={{ color: "var(--color-text-muted)" }} />
          ) : (
            <ChevronDown className="w-5 h-5" style={{ color: "var(--color-text-muted)" }} />
          )}
        </div>
      </button>

      {/* Error */}
      {error && (
        <div 
          className="mb-4 p-3 rounded-lg text-sm"
          style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }}
        >
          {error}
        </div>
      )}

      {/* List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {approvals.map((approval) => (
              <motion.div
                key={approval.id}
                className="p-4 rounded-xl"
                style={{ backgroundColor: "var(--color-bg-tertiary)" }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Action Type & Agent */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {ACTION_LABELS[approval.actionType]?.icon || "📋"}
                    </span>
                    <div>
                      <div 
                        className="font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {ACTION_LABELS[approval.actionType]?.es || approval.actionType}
                      </div>
                      {approval.agent && (
                        <div 
                          className="text-sm flex items-center gap-1"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <Dna className="w-3 h-3" />
                          {approval.agent.name}
                          <span 
                            className="text-xs px-1.5 rounded"
                            style={{ backgroundColor: "var(--color-bg-secondary)" }}
                          >
                            Gen {approval.agent.generation}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Time Left */}
                  <div 
                    className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg"
                    style={{ 
                      backgroundColor: "var(--color-bg-secondary)",
                      color: "var(--color-text-muted)" 
                    }}
                  >
                    <Clock className="w-3 h-3" />
                    {formatTimeLeft(approval.expiresAt)}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: "var(--color-text-muted)" }}>
                      Aprobación: {approval.currentPercentage.toFixed(0)}% / {approval.requiredPercentage}%
                    </span>
                    <span 
                      className="flex items-center gap-1"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <Users className="w-3 h-3" />
                      {approval.approvedBy.length} aprobado(s)
                    </span>
                  </div>
                  <div 
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: "var(--color-bg-secondary)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ 
                        backgroundColor: approval.currentPercentage >= approval.requiredPercentage 
                          ? "#10B981" 
                          : "var(--color-primary)" 
                      }}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min(100, (approval.currentPercentage / approval.requiredPercentage) * 100)}%` 
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {!approval.userHasApproved && !approval.userHasRejected && (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAction(approval.id, "approve")}
                      disabled={processingId === approval.id}
                      className="flex-1 flex items-center justify-center gap-1"
                    >
                      {processingId === approval.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Aprobar
                        </>
                      )}
                    </Button>
                    <button
                      onClick={() => handleAction(approval.id, "reject")}
                      disabled={processingId === approval.id}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                      style={{ 
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        color: "#EF4444",
                        border: "1px solid rgba(239, 68, 68, 0.3)"
                      }}
                    >
                      <X className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                )}

                {/* Already Voted */}
                {(approval.userHasApproved || approval.userHasRejected) && (
                  <div 
                    className="flex items-center justify-center gap-2 py-2 rounded-lg text-sm"
                    style={{ 
                      backgroundColor: approval.userHasApproved 
                        ? "rgba(16, 185, 129, 0.1)" 
                        : "rgba(239, 68, 68, 0.1)",
                      color: approval.userHasApproved ? "#10B981" : "#EF4444"
                    }}
                  >
                    {approval.userHasApproved ? (
                      <>
                        <Check className="w-4 h-4" />
                        Ya aprobaste esta solicitud
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Ya rechazaste esta solicitud
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default PendingApprovals;
