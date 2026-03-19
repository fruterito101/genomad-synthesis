// src/components/AgentDetailModal.tsx
// Modal de detalle de agente - Migrado a shadcn Dialog

"use client";

import { motion } from "framer-motion";
import { 
  Dna, Shield, Crown, Cpu, Palette, MessageSquare, Brain, Heart, 
  TrendingUp, GraduationCap, Star, ExternalLink, Copy, Check, Activity, 
  Trash2, Unlink, Power, AlertTriangle, Loader2 
} from "lucide-react";
import { CoOwnersDisplay } from "@/components/CoOwnersDisplay";
import { useState, useMemo } from "react";
import { 
  Button, Badge,
  Dialog, DialogContent, DialogHeader, DialogTitle,
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface AgentTraits { technical: number; creativity: number; social: number; analysis: number; empathy: number; trading: number; teaching: number; leadership: number; }
interface Agent { id: string; name: string; botUsername: string | null; dnaHash: string; traits: AgentTraits | string | null; fitness: number; generation: number; isActive: boolean; createdAt?: string; commitment?: string | null; tokenId?: string | null; parentAId?: string | null; parentBId?: string | null; owner?: { wallet: string | null } | null; isMine?: boolean; }
interface AgentDetailModalProps { 
  agent: Agent | null; 
  isOpen: boolean; 
  onClose: () => void;
  onAgentUpdated?: () => void;
  getAccessToken?: () => Promise<string | null>;
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
  const canDelete = isMine && !agent?.tokenId;
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
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Error al actualizar"); }
      onAgentUpdated?.();
    } catch (err: any) { setActionError(err.message); } finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    setActionLoading("delete");
    setActionError(null);
    try {
      const token = getAccessToken ? await getAccessToken() : null;
      if (!token) { setActionError("No auth token"); setActionLoading(null); return; }
      const res = await fetch(`/api/agents/${agent.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const data = await res.json(); throw new Error(data.message || data.error || "Error al eliminar"); }
      onAgentUpdated?.();
      onClose();
    } catch (err: any) { setActionError(err.message); setShowDeleteConfirm(false); } finally { setActionLoading(null); }
  };

  const handleUnlink = async () => {
    setActionLoading("unlink");
    setActionError(null);
    try {
      const token = getAccessToken ? await getAccessToken() : null;
      if (!token) { setActionError("No auth token"); setActionLoading(null); return; }
      const res = await fetch(`/api/agents/${agent.id}/unlink`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Error al desvincular"); }
      onAgentUpdated?.();
      onClose();
    } catch (err: any) { setActionError(err.message); setShowUnlinkConfirm(false); } finally { setActionLoading(null); }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${rarity.color}, var(--color-primary))` }}>
                <Dna className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl">{agent.name || (i18n.language === "es" ? "Agente Desconocido" : "Unknown Agent")}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  {agent.botUsername && <span className="text-sm text-muted-foreground">@{agent.botUsername}</span>}
                  <Badge variant="outline" style={{ borderColor: rarity.color, color: rarity.color }}><Star className="w-3 h-3 mr-1" />{rarity.label}</Badge>
                  {isMine && <Badge variant="outline" className="border-orange-500 text-orange-500">Mío</Badge>}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Error Display */}
            {actionError && (
              <div className="p-3 rounded-xl flex items-center gap-2 bg-destructive/10 border border-destructive">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">{actionError}</span>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl text-center bg-muted">
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{(agent.fitness ?? 0).toFixed(1)}</p>
                <p className="text-xs mt-1 text-muted-foreground">FITNESS</p>
              </div>
              <div className="p-4 rounded-xl text-center bg-muted">
                <p className="text-3xl sm:text-4xl font-bold text-primary">{agent.generation ?? 0}</p>
                <p className="text-xs mt-1 text-muted-foreground">{i18n.language === "es" ? "GENERACIÓN" : "GENERATION"}</p>
              </div>
              <div className="p-4 rounded-xl text-center bg-muted">
                <div className="flex items-center justify-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${agent.isActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                  <p className={`text-lg font-bold ${agent.isActive ? "text-emerald-500" : "text-destructive"}`}>{agent.isActive ? "Online" : "Offline"}</p>
                </div>
                <p className="text-xs mt-1 text-muted-foreground">{i18n.language === "es" ? "ESTADO" : "STATUS"}</p>
              </div>
            </div>

            {/* Co-owners Section */}
            {agent.id && <CoOwnersDisplay agentId={agent.id} variant="full" getAccessToken={getAccessToken} />}

            {/* All 8 Traits */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground"><Activity className="w-4 h-4" /> {t("agentDetail.traits")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sortedTraits.map(([key, value], index) => {
                  const config = traitConfig[key];
                  if (!config) return null;
                  const Icon = config.icon;
                  const safeValue = typeof value === "number" ? value : 50;
                  return (
                    <motion.div key={key} className="p-3 rounded-xl flex items-center gap-3 bg-muted" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}20` }}><Icon className="w-5 h-5" style={{ color: config.color }} /></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{t(config.labelKey)}</span>
                          <span className="text-sm font-bold" style={{ color: config.color }}>{safeValue}</span>
                        </div>
                        <div className="h-2 rounded-full bg-background"><motion.div className="h-full rounded-full" style={{ backgroundColor: config.color }} initial={{ width: 0 }} animate={{ width: `${safeValue}%` }} transition={{ duration: 0.5, delay: index * 0.05 }} /></div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* On-chain Info */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground"><Shield className="w-4 h-4" /> {i18n.language === "es" ? "DATOS ON-CHAIN" : "ON-CHAIN DATA"}</h3>
              <div className="p-4 rounded-xl space-y-3 bg-muted">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("agentDetail.dna")}</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs px-2 py-1 rounded bg-background text-muted-foreground">{agent.dnaHash ? `${agent.dnaHash.slice(0, 8)}...${agent.dnaHash.slice(-8)}` : "N/A"}</code>
                    <button onClick={copyHash} className="p-1 rounded hover:bg-white/10">{copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}</button>
                  </div>
                </div>
                {agent.commitment && <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Commitment</span><code className="text-xs px-2 py-1 rounded bg-background text-muted-foreground">{agent.commitment.slice(0, 12)}...</code></div>}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Token ID</span>
                  {agent.tokenId ? (<a href={`https://testnet.monadexplorer.com/token/0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0?a=${agent.tokenId}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary">#{agent.tokenId} <ExternalLink className="w-3 h-3" /></a>) : (<Badge variant="outline" className="border-yellow-500 text-yellow-500">{i18n.language === "es" ? "No acuñado" : "Not minted"}</Badge>)}
                </div>
                {agent.owner?.wallet && <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{t("agentDetail.owner")}</span><code className="text-xs px-2 py-1 rounded bg-background text-muted-foreground">{agent.owner.wallet.slice(0, 6)}...{agent.owner.wallet.slice(-4)}</code></div>}
              </div>
            </div>

            {/* Lineage */}
            {(agent.parentAId || agent.parentBId) && (
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground"><Dna className="w-4 h-4" /> {t("agentDetail.lineage")}</h3>
                <div className="p-4 rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground">{i18n.language === "es" ? "Criado de" : "Bred from"} Parent A ({agent.parentAId?.slice(0, 8)}...) × Parent B ({agent.parentBId?.slice(0, 8)}...)</p>
                </div>
              </div>
            )}

            {/* Agent Management */}
            {isMine && (
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground"><Shield className="w-4 h-4" /> {i18n.language === "es" ? "GESTIÓN" : "MANAGEMENT"}</h3>
                <div className="p-4 rounded-xl space-y-3 bg-muted">
                  {canToggle && (
                    <Button variant="outline" className="w-full justify-start" onClick={handleToggleActive} disabled={actionLoading === "toggle"}>
                      {actionLoading === "toggle" ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Power className={`w-5 h-5 mr-2 ${agent.isActive ? "text-yellow-500" : "text-emerald-500"}`} />}
                      {agent.isActive ? (i18n.language === "es" ? "Desactivar Agente" : "Deactivate Agent") : (i18n.language === "es" ? "Activar Agente" : "Activate Agent")}
                    </Button>
                  )}
                  {canUnlink && (
                    <Button variant="outline" className="w-full justify-start border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10" onClick={() => setShowUnlinkConfirm(true)}>
                      <Unlink className="w-5 h-5 mr-2" />
                      {i18n.language === "es" ? "Desvincular Agente" : "Unlink Agent"}
                    </Button>
                  )}
                  {canDelete && (
                    <Button variant="outline" className="w-full justify-start border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => setShowDeleteConfirm(true)}>
                      <Trash2 className="w-5 h-5 mr-2" />
                      {i18n.language === "es" ? "Eliminar Agente" : "Delete Agent"}
                    </Button>
                  )}
                  {agent.tokenId && (
                    <div className="p-3 rounded-lg bg-primary/10">
                      <p className="text-xs text-muted-foreground"><Shield className="w-3 h-3 inline mr-1" />{i18n.language === "es" ? "Este agente está minteado on-chain. No puede ser eliminado." : "This agent is minted on-chain. Cannot be deleted."}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Link href={`/breeding?parentA=${agent.id}`} className="flex-1">
                <Button className="w-full"><Dna className="w-4 h-4 mr-2" /> {t("agentDetail.actions.breed")}</Button>
              </Link>
              <Button variant="outline" onClick={onClose}>{t("common.close")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              <Trash2 className="w-5 h-5 inline mr-2" />
              {i18n.language === "es" ? "¿Eliminar Agente?" : "Delete Agent?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {i18n.language === "es" ? "⚠️ Esta acción es IRREVERSIBLE. El agente será eliminado permanentemente." : "⚠️ This action is IRREVERSIBLE. Agent will be deleted permanently."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n.language === "es" ? "Cancelar" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={actionLoading === "delete"} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {actionLoading === "delete" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {i18n.language === "es" ? "Sí, eliminar" : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unlink Confirmation AlertDialog */}
      <AlertDialog open={showUnlinkConfirm} onOpenChange={setShowUnlinkConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-yellow-500">
              <Unlink className="w-5 h-5 inline mr-2" />
              {i18n.language === "es" ? "¿Desvincular Agente?" : "Unlink Agent?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {i18n.language === "es" ? "Podrás volver a vincularlo con un nuevo código más tarde." : "You can re-link with a new code later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n.language === "es" ? "Cancelar" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlink} disabled={actionLoading === "unlink"} className="bg-yellow-500 text-black hover:bg-yellow-600">
              {actionLoading === "unlink" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Unlink className="w-4 h-4 mr-2" />}
              {i18n.language === "es" ? "Sí, desvincular" : "Yes, unlink"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default AgentDetailModal;
