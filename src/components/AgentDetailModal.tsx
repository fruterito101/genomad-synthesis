"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { AgentChatButton } from "./AgentChatButton";
import {
  X, Dna, Crown, Cpu, Palette, MessageSquare, Brain, Heart,
  TrendingUp, GraduationCap, Zap, Link2, Copy,
  Check, Users, GitBranch, Loader2, Shield, Sparkles, ExternalLink
} from "lucide-react";

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
}

interface AgentDetailModalProps {
  agent: AgentBasic | null;
  isOpen: boolean;
  onClose: () => void;
}

const traitConfig: Record<string, { icon: React.ElementType; color: string; label: string; gradient: string }> = {
  technical: { icon: Cpu, color: "#3B82F6", label: "Technical", gradient: "from-blue-500 to-cyan-500" },
  creativity: { icon: Palette, color: "#EC4899", label: "Creativity", gradient: "from-pink-500 to-rose-500" },
  social: { icon: MessageSquare, color: "#8B5CF6", label: "Social", gradient: "from-violet-500 to-purple-500" },
  analysis: { icon: Brain, color: "#06B6D4", label: "Analysis", gradient: "from-cyan-500 to-teal-500" },
  empathy: { icon: Heart, color: "#EF4444", label: "Empathy", gradient: "from-red-500 to-pink-500" },
  trading: { icon: TrendingUp, color: "#10B981", label: "Trading", gradient: "from-emerald-500 to-green-500" },
  teaching: { icon: GraduationCap, color: "#F59E0B", label: "Teaching", gradient: "from-amber-500 to-yellow-500" },
  leadership: { icon: Crown, color: "#F97316", label: "Leadership", gradient: "from-orange-500 to-amber-500" },
};

function getRarity(traits: Record<string, number>) {
  const values = Object.values(traits);
  if (values.length === 0) return { label: "Unknown", color: "#6B7280", bg: "from-gray-600 to-gray-700" };
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  if (avg >= 80) return { label: "Legendary", color: "#F59E0B", bg: "from-amber-500 to-orange-600" };
  if (avg >= 65) return { label: "Epic", color: "#8B5CF6", bg: "from-violet-500 to-purple-600" };
  if (avg >= 50) return { label: "Rare", color: "#3B82F6", bg: "from-blue-500 to-indigo-600" };
  return { label: "Common", color: "#6B7280", bg: "from-gray-500 to-gray-600" };
}

function shortenHash(hash: string | null | undefined): string {
  if (!hash) return "N/A";
  return hash.slice(0, 8) + "..." + hash.slice(-6);
}

export function AgentDetailModal({ agent, isOpen, onClose }: AgentDetailModalProps) {
  const { getAccessToken } = usePrivy();
  const [details, setDetails] = useState<AgentDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"stats" | "chain" | "family">("stats");

  useEffect(() => {
    if (!agent || !isOpen) {
      setDetails(null);
      setActiveTab("stats");
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
  const sortedTraits = Object.entries(agent.traits).sort(([, a], [, b]) => b - a);
  const topTrait = sortedTraits[0];
  const topTraitConfig = topTrait ? traitConfig[topTrait[0]] : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 
                       sm:w-full sm:max-w-xl sm:max-h-[90vh] overflow-hidden
                       bg-gradient-to-b from-card to-background border border-border/50 rounded-3xl shadow-2xl z-50"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Glowing Background Effect */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: `radial-gradient(circle, ${topTraitConfig?.color || '#7B3FE4'} 0%, transparent 70%)` }}
            />

            {/* Header with Avatar */}
            <div className="relative pt-8 pb-4 px-6">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Avatar & Name */}
              <div className="flex flex-col items-center">
                <motion.div 
                  className="relative"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  {/* Glow ring */}
                  <div 
                    className="absolute inset-0 rounded-full blur-xl opacity-50"
                    style={{ background: `linear-gradient(135deg, ${topTraitConfig?.color || '#7B3FE4'}, ${traitConfig[sortedTraits[1]?.[0]]?.color || '#00AA93'})` }}
                  />
                  {/* Avatar */}
                  <div 
                    className="relative w-24 h-24 rounded-full flex items-center justify-center border-4 border-background shadow-2xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${topTraitConfig?.color || '#7B3FE4'}, ${traitConfig[sortedTraits[1]?.[0]]?.color || '#00AA93'})` 
                    }}
                  >
                    <Dna className="w-10 h-10 text-white drop-shadow-lg" />
                  </div>
                  {/* Rarity Badge */}
                  <div 
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r ${rarity.bg}`}
                  >
                    {rarity.label}
                  </div>
                </motion.div>

                {/* Name & Gen */}
                <motion.h2 
                  className="mt-5 text-2xl font-bold"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {agent.name}
                </motion.h2>
                <motion.p 
                  className="text-muted-foreground text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  Generation {agent.generation}
                </motion.p>

                {/* Fitness Score */}
                <motion.div 
                  className="mt-4 flex items-center gap-3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: rarity.color }} />
                  <span className="text-4xl font-black" style={{ color: rarity.color }}>
                    {agent.fitness.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">FITNESS</span>
                </motion.div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-1 px-6 mb-4">
              {[
                { id: "stats", label: "Stats", icon: Sparkles },
                { id: "chain", label: "On-Chain", icon: Link2 },
                { id: "family", label: "Family", icon: GitBranch },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                      : "text-muted-foreground hover:bg-white/5"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="px-6 pb-6 overflow-y-auto max-h-[45vh]">
              <AnimatePresence mode="wait">
                {/* Stats Tab */}
                {activeTab === "stats" && (
                  <motion.div
                    key="stats"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    {sortedTraits.map(([key, value], index) => {
                      const config = traitConfig[key];
                      const Icon = config?.icon || Cpu;
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative overflow-hidden p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition group"
                        >
                          {/* Background glow on hover */}
                          <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                            style={{ background: config?.color }}
                          />
                          
                          <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                                  style={{ background: `${config?.color}20` }}
                                >
                                  <Icon className="w-4 h-4" style={{ color: config?.color }} />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">{config?.label || key}</span>
                              </div>
                              <span className="text-xl font-bold" style={{ color: config?.color }}>
                                {(value as number).toFixed(0)}
                              </span>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                              <motion.div 
                                className={`h-full rounded-full bg-gradient-to-r ${config?.gradient}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${value}%` }}
                                transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {/* On-Chain Tab */}
                {activeTab === "chain" && (
                  <motion.div
                    key="chain"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : details ? (
                      <>
                        {/* Status Card */}
                        <div className={`p-5 rounded-2xl border ${
                          details.agent.tokenId 
                            ? "bg-emerald-500/10 border-emerald-500/30" 
                            : "bg-amber-500/10 border-amber-500/30"
                        }`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                              details.agent.tokenId ? "bg-emerald-500/20" : "bg-amber-500/20"
                            }`}>
                              {details.agent.tokenId ? (
                                <Zap className="w-7 h-7 text-emerald-500" />
                              ) : (
                                <Shield className="w-7 h-7 text-amber-500" />
                              )}
                            </div>
                            <div>
                              <p className={`text-lg font-bold ${
                                details.agent.tokenId ? "text-emerald-500" : "text-amber-500"
                              }`}>
                                {details.agent.tokenId ? "Minted on Base" : "Off-Chain Agent"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {details.agent.tokenId 
                                  ? "This agent exists on the blockchain" 
                                  : "Not yet minted as NFT"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 gap-3">
                          {details.agent.tokenId && (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                              <p className="text-xs text-muted-foreground mb-1">Token ID</p>
                              <div className="flex items-center justify-between">
                                <p className="font-mono font-bold text-lg">#{details.agent.tokenId}</p>
                                <button 
                                  onClick={() => copyToClipboard(details.agent.tokenId!, 'token')}
                                  className="p-2 hover:bg-white/10 rounded-lg transition"
                                >
                                  {copied === 'token' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                              </div>
                              {/* View on Blockchain Button */}
                              <a
                                href={`https://sepolia.basescan.org/token/0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0?a=${details.agent.tokenId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary font-medium transition"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Ver en BaseScan
                              </a>
                              {/* Chat Button */}
                              <AgentChatButton
                                agent={{
                                  id: details.agent.id,
                                  name: details.agent.name,
                                  traits: details.agent.traits as any,
                                  tokenId: details.agent.tokenId || undefined,
                                }}
                                className="mt-2 w-full justify-center"
                              />
                            </div>
                          )}

                          {details.agent.dnaHash && (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                              <p className="text-xs text-muted-foreground mb-1">DNA Hash</p>
                              <div className="flex items-center justify-between">
                                <p className="font-mono text-sm">{shortenHash(details.agent.dnaHash)}</p>
                                <button 
                                  onClick={() => copyToClipboard(details.agent.dnaHash!, 'dna')}
                                  className="p-2 hover:bg-white/10 rounded-lg transition"
                                >
                                  {copied === 'dna' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          )}

                          {details.agent.botUsername && (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                              <p className="text-xs text-muted-foreground mb-1">Telegram Bot</p>
                              <p className="font-medium">@{details.agent.botUsername}</p>
                            </div>
                          )}

                          {/* Ownership */}
                          {(details.agent.isOwner || details.agent.isCoOwner) && (
                            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                              <div className="flex items-center gap-3">
                                <Crown className="w-5 h-5 text-primary" />
                                <div>
                                  <p className="font-medium text-primary">
                                    {details.agent.isOwner ? "You own this agent" : "Co-owner"}
                                  </p>
                                  {details.agent.isCoOwner && !details.agent.isOwner && (
                                    <p className="text-xs text-muted-foreground">
                                      {details.agent.custodyShare.toFixed(1)}% custody share
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">Could not load details</p>
                    )}
                  </motion.div>
                )}

                {/* Family Tab */}
                {activeTab === "family" && (
                  <motion.div
                    key="family"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : details ? (
                      <>
                        {/* Parents */}
                        {(details.parents.parentA || details.parents.parentB) ? (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                              <GitBranch className="w-4 h-4" /> PARENTS
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              {details.parents.parentA && (
                                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                                    <Dna className="w-5 h-5 text-primary" />
                                  </div>
                                  <p className="font-bold truncate">{details.parents.parentA.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Fitness: <span className="text-primary">{details.parents.parentA.fitness.toFixed(1)}</span>
                                  </p>
                                </div>
                              )}
                              {details.parents.parentB && (
                                <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30">
                                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mb-2">
                                    <Dna className="w-5 h-5 text-secondary" />
                                  </div>
                                  <p className="font-bold truncate">{details.parents.parentB.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Fitness: <span className="text-secondary">{details.parents.parentB.fitness.toFixed(1)}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                            <Sparkles className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                            <p className="font-medium">Genesis Agent</p>
                            <p className="text-sm text-muted-foreground">No parents - Gen 0</p>
                          </div>
                        )}

                        {/* Children */}
                        {details.children.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4" /> CHILDREN ({details.children.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {details.children.map((child) => (
                                <div 
                                  key={child.id} 
                                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition"
                                >
                                  <p className="font-medium text-sm">{child.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Gen {child.generation} • {child.fitness.toFixed(1)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {details.children.length === 0 && (details.parents.parentA || details.parents.parentB) && (
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                            <p className="text-muted-foreground text-sm">No children yet</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">Could not load family tree</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AgentDetailModal;
