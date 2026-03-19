"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, Dna, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface BreedingRequest {
  id: string;
  status: string;
  parentA: { id: string; name: string; approved: boolean } | null;
  parentB: { id: string; name: string; approved: boolean } | null;
  childName: string;
  isInitiator: boolean;
  needsMyApproval: boolean;
  createdAt: string;
  expiresAt: string;
  expired: boolean;
}

interface BreedingRequestsProps {
  onUpdate?: () => void;
}

export function BreedingRequests({ onUpdate }: BreedingRequestsProps) {
  const { authenticated, getAccessToken } = usePrivy();
  const { i18n } = useTranslation();
  const isEs = i18n.language === "es";
  
  const [requests, setRequests] = useState<BreedingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!authenticated) return;
    try {
      setLoading(true);
      const token = await getAccessToken();
      const res = await fetch("/api/breeding/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.pending || []);
      }
    } catch (e) {
      console.error("Failed to fetch breeding requests", e);
    } finally {
      setLoading(false);
    }
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      const token = await getAccessToken();
      const res = await fetch(`/api/breeding/${requestId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        fetchRequests();
        onUpdate?.();
      }
    } catch (e) {
      console.error("Failed to approve", e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      const token = await getAccessToken();
      const res = await fetch(`/api/breeding/${requestId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        fetchRequests();
        onUpdate?.();
      }
    } catch (e) {
      console.error("Failed to reject", e);
    } finally {
      setProcessingId(null);
    }
  };

  const needsAction = requests.filter((r) => r.needsMyApproval);

  if (!authenticated || loading) return null;
  if (needsAction.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 mb-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold text-amber-500">
          {isEs ? "Solicitudes de Breeding Pendientes" : "Pending Breeding Requests"}
        </h3>
        <span className="ml-auto px-2 py-0.5 bg-amber-500 text-black text-xs font-bold rounded-full">
          {needsAction.length}
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {needsAction.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <Dna className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">
                      {req.parentA?.name || "?"} × {req.parentB?.name || "?"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isEs ? "Hijo:" : "Child:"} {req.childName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {isEs ? "Expira" : "Expires"}{" "}
                        {formatDistanceToNow(new Date(req.expiresAt), {
                          addSuffix: true,
                          locale: isEs ? es : undefined,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() => handleReject(req.id)}
                    disabled={processingId === req.id}
                  >
                    {processingId === req.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        {isEs ? "Rechazar" : "Reject"}
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(req.id)}
                    disabled={processingId === req.id}
                  >
                    {processingId === req.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        {isEs ? "Aceptar" : "Accept"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
