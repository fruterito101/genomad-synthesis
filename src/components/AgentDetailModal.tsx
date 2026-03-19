// src/components/AgentDetailModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Dna, Shield, Clock, Crown, Cpu, Palette, MessageSquare, Brain, Heart, TrendingUp, GraduationCap, Star, ExternalLink, Copy, Check, Activity, Trash2, Unlink, Power, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface AgentTraits { technical: number; creativity: number; social: number; analysis: number; empathy: number; trading: number; teaching: number; leadership: number; }
interface Agent { id: string; name: string; botUsername: string | null; dnaHash: string; traits: AgentTraits | string | null; fitness: number; generation: number; isActive: boolean; createdAt?: string; commitment?: string | null; tokenId?: string | null; parentAId?: string | null; parentBId?: string | null; owner?: { wallet: string | null } | null; isMine?: boolean; }
interface AgentDetailModalProps { 
  agent: Agent | null; 
  isOpen: boolean; 
  onClose: () => void;
  onAgentUpdated?: () => void; // Callback to refresh data after actions
  getAccessToken?: () => Promise<string | null>; // Privy token getter
}

const defaultTraits: AgentTraits = { technical: 50, creativity: 50, social: 50, analysis: 50, empathy: 50, trading: 50, teaching: 50, leadership: 50 };

function parseTraits(traits: AgentTraits | string | null | undefined): AgentTraits {
  if (!traits) return defaultTraits;
  if (typeof traits === "string") { try { return { ...defaultTraits, ...JSON.parse(traits) }; } catch { return defaultTraits; } }
  return { ...defaultTraits, ...traits };
}

export function AgentDetailModal({ agent, isOpen, onClose, onAgentUpdated, getAccessToken }: AgentDetailModalProps) {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const traitConfig: Record<string, { icon: React.ElementType; color: string; labelKey: string }> = {
    technical: { icon: Cpu, color: "#3B82F6", labelKey: "dashboard.traits.technical" },
    creativity: { icon: Palette, color: "#EC4899", labelKey: "dashboard.traits.creativity" },
    social: { icon: MessageSquare, color: "#8B5CF6", labelKey: "dashboard.traits.social" },
    analysis: { icon: Brain, color: "#06B6D4", labelKey: "dashboard.traits.analysis" },
    empathy: { icon: Heart, color: "#EF4444", labelKey: "dashboard.traits.empathy" },
    trading: { icon: TrendingUp, color: "#10B981", labelKey: "dashboard.traits.trading" },
    teaching: { icon: GraduationCap, color: "#F59E0B", labelKey: "dashboard.traits.teaching" },
    leadership: { icon: Crown, color: "#F97316", labelKey: "dashboard.traits.leadership" },
  };

  function getRarity(traits: AgentTraits): { label: string; color: string; bg: string } {
    const values = Object.values(traits);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const spread = max - Math.min(...values);
    if (avg >= 80 && spread <= 20) return { label: t("dashboard.rarity.legendary"), color: "#FBBF24", bg: "rgba(251, 191, 36, 0.15)" };
    if (avg >= 75 || max >= 95) return { label: t("dashboard.rarity.epic"), color: "#A855F7", bg: "rgba(168, 85, 247, 0.15)" };
    if (avg >= 60 || max >= 85) return { label: t("dashboard.rarity.rare"), color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)" };
    if (avg >= 40) return { label: t("dashboard.rarity.uncommon"), color: "#10B981", bg: "rgba(16, 185, 129, 0.15)" };
    return { label: t("dashboard.rarity.common"), color: "#6B7280", bg: "rgba(107, 114, 128, 0.15)" };
  }

  const safeTraits = useMemo(() => parseTraits(agent?.traits), [agent?.traits]);
  const rarity = useMemo(() => getRarity(safeTraits), [safeTraits, i18n.language]);
  const sortedTraits = useMemo(() => Object.entries(safeTraits).sort(([, a], [, b]) => b - a), [safeTraits]);

  const isMine = agent?.isMine ?? false;
  const canDelete = isMine && !agent?.tokenId; // Can't delete minted agents
  const canUnlink = isMine;
  const canToggle = isMine;

  if (!agent) return null;

  const copyHash = () => { navigator.clipboard.writeText(agent.dnaHash || ""); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleToggleActive = async () => {
    setActionLoading("toggle");
    setActionError(null);
    try {
      const token = getAccessToken ? await getAccessToken() : null;
      if (!token) { setActionError("No auth token"); setActionLoading(null); return; }
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !agent.isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar");
      }
      onAgentUpdated?.();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    setActionLoading("delete");
    setActionError(null);
    try {
      const token = getAccessToken ? await getAccessToken() : null;
      if (!token) { setActionError("No auth token"); setActionLoading(null); return; }
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || "Error al eliminar");
      }
      onAgentUpdated?.();
      onClose();
    } catch (err: any) {
      setActionError(err.message);
      setShowDeleteConfirm(false);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnlink = async () => {
    setActionLoading("unlink");
    setActionError(null);
    try {
      const token = getAccessToken ? await getAccessToken() : null;
      if (!token) { setActionError("No auth token"); setActionLoading(null); return; }
      const res = await fetch(`/api/agents/${agent.id}/unlink`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al desvincular");
      }
      onAgentUpdated?.();
      onClose();
    } catch (err: any) {
      setActionError(err.message);
      setShowUnlinkConfirm(false);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            {/* Header */}
            <div className="sticky top-0 z-10 p-4 sm:p-6 flex items-start justify-between glass rounded-t-2xl" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${rarity.color}, var(--color-primary))` }}>
                  <Dna className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>{agent.name || (i18n.language === "es" ? "Agente Desconocido" : "Unknown Agent")}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {agent.botUsername && <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>@{agent.botUsername}</span>}
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: rarity.bg, color: rarity.color }}><Star className="w-3 h-3 inline mr-1" />{rarity.label}</span>
                    {isMine && <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "rgba(249, 115, 22, 0.15)", color: "#f97316" }}>Mío</span>}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition" style={{ color: "var(--color-text-secondary)" }}><X className="w-6 h-6" /></button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Error Display */}
              {actionError && (
                <div className="p-3 rounded-xl flex items-center gap-2" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--color-error)" }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: "var(--color-error)" }} />
                  <span className="text-sm" style={{ color: "var(--color-error)" }}>{actionError}</span>
                </div>
              )}

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
                  <p className="text-3xl sm:text-4xl font-bold gradient-text">{(agent.fitness ?? 0).toFixed(1)}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>FITNESS</p>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
                  <p className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--color-primary)" }}>{agent.generation ?? 0}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{i18n.language === "es" ? "GENERACIÓN" : "GENERATION"}</p>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${agent.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                    <p className="text-lg font-bold" style={{ color: agent.isActive ? "var(--color-success)" : "var(--color-error)" }}>{agent.isActive ? "Online" : "Offline"}</p>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{i18n.language === "es" ? "ESTADO" : "STATUS"}</p>
                </div>
              </div>

              {/* All 8 Traits */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}><Activity className="w-4 h-4" /> {t("agentDetail.traits")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sortedTraits.map(([key, value], index) => {
                    const config = traitConfig[key];
                    if (!config) return null;
                    const Icon = config.icon;
                    const safeValue = typeof value === "number" ? value : 50;
                    return (
                      <motion.div key={key} className="p-3 rounded-xl flex items-center gap-3" style={{ backgroundColor: "var(--color-bg-tertiary)" }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}20` }}><Icon className="w-5 h-5" style={{ color: config.color }} /></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{t(config.labelKey)}</span>
                            <span className="text-sm font-bold" style={{ color: config.color }}>{safeValue}</span>
                          </div>
                          <div className="h-2 rounded-full" style={{ backgroundColor: "var(--color-bg-primary)" }}><motion.div className="h-full rounded-full" style={{ backgroundColor: config.color }} initial={{ width: 0 }} animate={{ width: `${safeValue}%` }} transition={{ duration: 0.5, delay: index * 0.05 }} /></div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* On-chain Info */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}><Shield className="w-4 h-4" /> {i18n.language === "es" ? "DATOS ON-CHAIN" : "ON-CHAIN DATA"}</h3>
                <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>{t("agentDetail.dna")}</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-secondary)" }}>{agent.dnaHash ? `${agent.dnaHash.slice(0, 8)}...${agent.dnaHash.slice(-8)}` : "N/A"}</code>
                      <button onClick={copyHash} className="p-1 rounded hover:bg-white/10">{copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />}</button>
                    </div>
                  </div>
                  {agent.commitment && <div className="flex items-center justify-between"><span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Commitment</span><code className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-secondary)" }}>{agent.commitment.slice(0, 12)}...</code></div>}
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Token ID</span>
                    {agent.tokenId ? (<a href={`https://testnet.monadexplorer.com/token/0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0?a=${agent.tokenId}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm" style={{ color: "var(--color-primary)" }}>#{agent.tokenId} <ExternalLink className="w-3 h-3" /></a>) : (<span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", color: "var(--color-warning)" }}>{i18n.language === "es" ? "No acuñado" : "Not minted"}</span>)}
                  </div>
                  {agent.owner?.wallet && <div className="flex items-center justify-between"><span className="text-sm" style={{ color: "var(--color-text-muted)" }}>{t("agentDetail.owner")}</span><code className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-secondary)" }}>{agent.owner.wallet.slice(0, 6)}...{agent.owner.wallet.slice(-4)}</code></div>}
                </div>
              </div>

              {/* Lineage */}
              {(agent.parentAId || agent.parentBId) && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}><Dna className="w-4 h-4" /> {t("agentDetail.lineage")}</h3>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{i18n.language === "es" ? "Criado de" : "Bred from"} Parent A ({agent.parentAId?.slice(0, 8)}...) × Parent B ({agent.parentBId?.slice(0, 8)}...)</p>
                  </div>
                </div>
              )}

              {/* Agent Management (only for owner) */}
              {isMine && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
                    <Shield className="w-4 h-4" /> {i18n.language === "es" ? "GESTIÓN" : "MANAGEMENT"}
                  </h3>
                  <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
                    {/* Toggle Active */}
                    {canToggle && (
                      <button
                        onClick={handleToggleActive}
                        disabled={actionLoading === "toggle"}
                        className="w-full p-3 rounded-lg flex items-center justify-between transition-colors hover:bg-white/5"
                        style={{ border: "1px solid var(--color-border)" }}
                      >
                        <div className="flex items-center gap-3">
                          <Power className="w-5 h-5" style={{ color: agent.isActive ? "var(--color-warning)" : "var(--color-success)" }} />
                          <div className="text-left">
                            <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                              {agent.isActive ? (i18n.language === "es" ? "Desactivar Agente" : "Deactivate Agent") : (i18n.language === "es" ? "Activar Agente" : "Activate Agent")}
                            </p>
                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                              {agent.isActive ? (i18n.language === "es" ? "El agente dejará de estar activo" : "Agent will go offline") : (i18n.language === "es" ? "El agente volverá a estar activo" : "Agent will go online")}
                            </p>
                          </div>
                        </div>
                        {actionLoading === "toggle" && <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--color-text-muted)" }} />}
                      </button>
                    )}

                    {/* Unlink */}
                    {canUnlink && !showUnlinkConfirm && (
                      <button
                        onClick={() => setShowUnlinkConfirm(true)}
                        className="w-full p-3 rounded-lg flex items-center justify-between transition-colors hover:bg-white/5"
                        style={{ border: "1px solid var(--color-border)" }}
                      >
                        <div className="flex items-center gap-3">
                          <Unlink className="w-5 h-5" style={{ color: "var(--color-warning)" }} />
                          <div className="text-left">
                            <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{i18n.language === "es" ? "Desvincular Agente" : "Unlink Agent"}</p>
                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{i18n.language === "es" ? "Quitar de tu cuenta (puede re-vincularse)" : "Remove from your account (can re-link)"}</p>
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Unlink Confirmation */}
                    {showUnlinkConfirm && (
                      <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid var(--color-warning)" }}>
                        <p className="text-sm mb-3" style={{ color: "var(--color-warning)" }}>
                          {i18n.language === "es" ? "¿Seguro que quieres desvincular este agente? Podrás volver a vincularlo con un código." : "Are you sure? You can re-link with a new code later."}
                        </p>
                        <div className="flex gap-2">
                          <button onClick={handleUnlink} disabled={actionLoading === "unlink"} className="flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2" style={{ backgroundColor: "var(--color-warning)", color: "#000" }}>
                            {actionLoading === "unlink" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                            {i18n.language === "es" ? "Sí, desvincular" : "Yes, unlink"}
                          </button>
                          <button onClick={() => setShowUnlinkConfirm(false)} className="px-3 py-2 rounded-lg text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            {i18n.language === "es" ? "Cancelar" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Delete */}
                    {canDelete && !showDeleteConfirm && (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full p-3 rounded-lg flex items-center justify-between transition-colors hover:bg-white/5"
                        style={{ border: "1px solid var(--color-error)" }}
                      >
                        <div className="flex items-center gap-3">
                          <Trash2 className="w-5 h-5" style={{ color: "var(--color-error)" }} />
                          <div className="text-left">
                            <p className="text-sm font-medium" style={{ color: "var(--color-error)" }}>{i18n.language === "es" ? "Eliminar Agente" : "Delete Agent"}</p>
                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{i18n.language === "es" ? "Eliminar permanentemente (irreversible)" : "Delete permanently (irreversible)"}</p>
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Delete Confirmation */}
                    {showDeleteConfirm && (
                      <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--color-error)" }}>
                        <p className="text-sm mb-3" style={{ color: "var(--color-error)" }}>
                          {i18n.language === "es" ? "⚠️ Esta acción es IRREVERSIBLE. El agente será eliminado permanentemente." : "⚠️ This action is IRREVERSIBLE. Agent will be deleted permanently."}
                        </p>
                        <div className="flex gap-2">
                          <button onClick={handleDelete} disabled={actionLoading === "delete"} className="flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2" style={{ backgroundColor: "var(--color-error)", color: "#fff" }}>
                            {actionLoading === "delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            {i18n.language === "es" ? "Sí, eliminar" : "Yes, delete"}
                          </button>
                          <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-2 rounded-lg text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            {i18n.language === "es" ? "Cancelar" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Warning for minted */}
                    {agent.tokenId && (
                      <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          <Shield className="w-3 h-3 inline mr-1" />
                          {i18n.language === "es" ? "Este agente está minteado on-chain. No puede ser eliminado, solo desvinculado." : "This agent is minted on-chain. Cannot be deleted, only unlinked."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Link href={`/breeding?parentA=${agent.id}`} className="flex-1">
                  <Button variant="primary" className="w-full"><Dna className="w-4 h-4" /> {t("agentDetail.actions.breed")}</Button>
                </Link>
                <Button variant="secondary" onClick={onClose}>{t("common.close")}</Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AgentDetailModal;
