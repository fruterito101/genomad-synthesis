"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import {
  X, Dna, Crown, Cpu, Palette, MessageSquare, Brain, Heart,
  TrendingUp, GraduationCap, Zap, Link2, ExternalLink, Copy,
  Check, Users, GitBranch, Loader2, Shield, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui";

interface AgentBasic {
  id: string;
  name: string;
  fitness: number;
  generation: number;
  traits: Record<string, number>;
}

interface AgentDetail {
  id: string;
  name: string;
  botUsername: string | null;
  dnaHash: string | null;
  traits: Record<string, number>;
  fitness: number;
  generation: number;
  tokenId: string | null;
  isActive: boolean;
  createdAt: string;
  isOwner: boolean;
  isCoOwner: boolean;
  custodyShare: number;
}

interface AgentDetailResponse {
  agent: AgentDetail;
  parents: {
    parentA: { id: string; name: string; dnaHash: string | null; fitness: number } | null;
    parentB: { id: string; name: string; dnaHash: string | null; fitness: number } | null;
  };
  children: { id: string; name: string; fitness: number; generation: number }[];
  canDelete: boolean;
  canUnlink: boolean;
  canToggleActive: boolean;
}

interface AgentDetailModalProps {
  agent: AgentBasic | null;
  isOpen: boolean;
  onClose: () => void;
}

const traitConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  technical: { icon: Cpu, color: "#3B82F6", label: "Technical" },
  creativity: { icon: Palette, color: "#EC4899", label: "Creativity" },
  social: { icon: MessageSquare, color: "#8B5CF6", label: "Social" },
  analysis: { icon: Brain, color: "#06B6D4", label: "Analysis" },
  empathy: { icon: Heart, color: "#EF4444", label: "Empathy" },
  trading: { icon: TrendingUp, color: "#10B981", label: "Trading" },
  teaching: { icon: GraduationCap, color: "#F59E0B", label: "Teaching" },
  leadership: { icon: Crown, color: "#F97316", label: "Leadership" },
};

function getRarity(traits: Record<string, number>) {
  const values = Object.values(traits);
  if (values.length === 0) return { label: "Unknown", color: "#6B7280" };
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  if (avg >= 80) return { label: "Legendary", color: "#F59E0B" };
  if (avg >= 65) return { label: "Epic", color: "#8B5CF6" };
  if (avg >= 50) return { label: "Rare", color: "#3B82F6" };
  return { label: "Common", color: "#6B7280" };
}

function shortenHash(hash: string | null | undefined): string {
  if (!hash) return "N/A";
  return hash.slice(0, 6) + "..." + hash.slice(-4);
}

export function AgentDetailModal({ agent, isOpen, onClose }: AgentDetailModalProps) {
  const { getAccessToken } = usePrivy();
  const [details, setDetails] = useState<AgentDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!agent || !isOpen) {
      setDetails(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const token = await getAccessToken();
        const res = await fetch(`/api/agents/${agent.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDetails(data);
        }
      } catch (err) {
        console.error("Failed to fetch agent details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [agent, isOpen, getAccessToken]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!agent) return null;

  const rarity = getRarity(agent.traits);
  const sortedTraits = Object.entries(agent.traits)
    .sort(([, a], [, b]) => b - a);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 
                       sm:w-full sm:max-w-2xl sm:max-h-[90vh] overflow-y-auto
                       bg-card border border-border rounded-2xl shadow-2xl z-50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border p-4 sm:p-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${traitConfig[sortedTraits[0]?.[0]]?.color || '#7B3FE4'}, ${traitConfig[sortedTraits[1]?.[0]]?.color || '#00AA93'})` 
                  }}
                >
                  <Dna className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">{agent.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: rarity.color + '20', color: rarity.color }}
                    >
                      {rarity.label}
                    </span>
                    <span className="text-sm text-muted-foreground">Gen {agent.generation}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Fitness Score */}
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Fitness Score</p>
                <p className="text-5xl font-bold" style={{ color: rarity.color }}>
                  {agent.fitness.toFixed(1)}
                </p>
              </div>

              {/* On-Chain Status */}
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : details && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-primary" />
                    On-Chain Status
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium flex items-center gap-1">
                        {details.agent.tokenId ? (
                          <><Zap className="w-4 h-4 text-emerald-500" /> Minted</>
                        ) : (
                          <><Shield className="w-4 h-4 text-amber-500" /> Off-chain</>
                        )}
                      </p>
                    </div>
                    {details.agent.tokenId && (
                      <div>
                        <p className="text-muted-foreground">Token ID</p>
                        <button 
                          onClick={() => copyToClipboard(details.agent.tokenId!, 'tokenId')}
                          className="font-mono text-xs flex items-center gap-1 hover:text-primary transition"
                        >
                          #{details.agent.tokenId}
                          {copied === 'tokenId' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                    {details.agent.dnaHash && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">DNA Hash</p>
                        <button 
                          onClick={() => copyToClipboard(details.agent.dnaHash!, 'dnaHash')}
                          className="font-mono text-xs flex items-center gap-1 hover:text-primary transition"
                        >
                          {shortenHash(details.agent.dnaHash)}
                          {copied === 'dnaHash' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                    {details.agent.botUsername && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Bot</p>
                        <p className="font-medium">@{details.agent.botUsername}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* All Traits */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  All Traits
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {sortedTraits.map(([key, value]) => {
                    const config = traitConfig[key];
                    const Icon = config?.icon || Cpu;
                    return (
                      <div key={key} className="p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4" style={{ color: config?.color }} />
                          <span className="text-xs text-muted-foreground capitalize">{config?.label || key}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">{(value as number).toFixed(0)}</span>
                        </div>
                        <div className="h-1.5 rounded-full mt-2 bg-muted">
                          <div 
                            className="h-full rounded-full transition-all" 
                            style={{ width: `${value}%`, backgroundColor: config?.color }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Parents */}
              {details && (details.parents.parentA || details.parents.parentB) && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-primary" />
                    Parents
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {details.parents.parentA && (
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                        <p className="text-xs text-muted-foreground mb-1">Parent A</p>
                        <p className="font-semibold">{details.parents.parentA.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Fitness: {details.parents.parentA.fitness.toFixed(1)}
                        </p>
                      </div>
                    )}
                    {details.parents.parentB && (
                      <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/30">
                        <p className="text-xs text-muted-foreground mb-1">Parent B</p>
                        <p className="font-semibold">{details.parents.parentB.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Fitness: {details.parents.parentB.fitness.toFixed(1)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Children */}
              {details && details.children.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    Children ({details.children.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {details.children.map((child) => (
                      <div 
                        key={child.id} 
                        className="px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm"
                      >
                        <span className="font-medium">{child.name}</span>
                        <span className="text-muted-foreground ml-2">
                          Gen {child.generation} • {child.fitness.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ownership Info */}
              {details && (details.agent.isOwner || details.agent.isCoOwner) && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-sm font-medium text-emerald-500 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {details.agent.isOwner ? "You own this agent" : `Co-owner (${details.agent.custodyShare.toFixed(1)}%)`}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-border p-4 flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AgentDetailModal;
