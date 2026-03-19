// src/components/CoOwnersDisplay.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, User, Crown, ChevronDown, ChevronUp } from "lucide-react";

interface CustodyShare {
  ownerId: string;
  ownerName: string;
  ownerWallet?: string | null;
  share: number;
  source: string;
}

interface CustodyInfo {
  agentId: string;
  isShared: boolean;
  totalCoOwners: number;
  shares: CustodyShare[];
  currentUserShare: number;
  isCurrentUserCoOwner: boolean;
}

interface CoOwnersDisplayProps {
  agentId: string;
  variant?: "compact" | "full";
  getAccessToken?: () => Promise<string | null>;
}

// Colores para cada co-owner
const OWNER_COLORS = [
  "#7B3FE4", // Primary purple
  "#00AA93", // Teal
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#3B82F6", // Blue
  "#10B981", // Green
];

export function CoOwnersDisplay({ 
  agentId, 
  variant = "compact",
  getAccessToken 
}: CoOwnersDisplayProps) {
  const [custody, setCustody] = useState<CustodyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchCustody = async () => {
      try {
        const headers: Record<string, string> = {};
        if (getAccessToken) {
          const token = await getAccessToken();
          if (token) headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(`/api/agents/${agentId}/custody`, { headers });
        if (res.ok) {
          const data = await res.json();
          setCustody(data);
        }
      } catch (err) {
        console.error("Failed to fetch custody:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustody();
  }, [agentId, getAccessToken]);

  if (loading) {
    return (
      <div className="flex items-center gap-1 animate-pulse">
        <Users className="w-3 h-3" style={{ color: "var(--color-text-muted)" }} />
        <div className="h-3 w-12 rounded" style={{ backgroundColor: "var(--color-bg-tertiary)" }} />
      </div>
    );
  }

  if (!custody || !custody.isShared) {
    // Single owner - no need to show
    return null;
  }

  // Sort by share descending
  const sortedShares = [...custody.shares].sort((a, b) => b.share - a.share);

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex -space-x-1.5">
          {sortedShares.slice(0, 3).map((share, idx) => (
            <div
              key={share.ownerId}
              className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white border-2 border-[var(--color-bg-secondary)]"
              style={{ 
                backgroundColor: OWNER_COLORS[idx % OWNER_COLORS.length],
                
                zIndex: 3 - idx
              }}
              title={`${share.ownerName}: ${share.share}%`}
            >
              {share.ownerName.charAt(0).toUpperCase()}
            </div>
          ))}
          {sortedShares.length > 3 && (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-medium border-2 border-[var(--color-bg-secondary)]"
              style={{ 
                backgroundColor: "var(--color-bg-tertiary)",
                color: "var(--color-text-muted)",
              }}
            >
              +{sortedShares.length - 3}
            </div>
          )}
        </div>
        <span 
          className="text-[10px] font-medium"
          style={{ color: "var(--color-text-muted)" }}
        >
          {custody.totalCoOwners} co-owners
        </span>
      </div>
    );
  }

  // Full variant
  return (
    <div 
      className="rounded-lg p-2"
      style={{ backgroundColor: "var(--color-bg-tertiary)" }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
          <span 
            className="text-xs font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            {custody.totalCoOwners} Co-owners
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
        ) : (
          <ChevronDown className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2">
              {sortedShares.map((share, idx) => (
                <div 
                  key={share.ownerId}
                  className="flex items-center gap-2"
                >
                  {/* Avatar */}
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: OWNER_COLORS[idx % OWNER_COLORS.length] }}
                  >
                    {share.ownerName.charAt(0).toUpperCase()}
                  </div>

                  {/* Name & Wallet */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span 
                        className="text-xs font-medium truncate"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {share.ownerName}
                      </span>
                      {idx === 0 && (
                        <Crown 
                          className="w-3 h-3 flex-shrink-0" 
                          style={{ color: "#FBBF24" }} 
                          
                        />
                      )}
                    </div>
                    {share.ownerWallet && (
                      <span 
                        className="text-[10px]"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {share.ownerWallet}
                      </span>
                    )}
                  </div>

                  {/* Share % */}
                  <div className="text-right flex-shrink-0">
                    <span 
                      className="text-xs font-bold"
                      style={{ color: OWNER_COLORS[idx % OWNER_COLORS.length] }}
                    >
                      {share.share}%
                    </span>
                  </div>
                </div>
              ))}

              {/* Progress Bar */}
              <div className="pt-1">
                <div 
                  className="h-2 rounded-full overflow-hidden flex"
                  style={{ backgroundColor: "var(--color-bg-secondary)" }}
                >
                  {sortedShares.map((share, idx) => (
                    <motion.div
                      key={share.ownerId}
                      className="h-full"
                      style={{ 
                        width: `${share.share}%`,
                        backgroundColor: OWNER_COLORS[idx % OWNER_COLORS.length]
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${share.share}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                    />
                  ))}
                </div>
              </div>

              {/* Current user share */}
              {custody.isCurrentUserCoOwner && (
                <div 
                  className="mt-2 text-[10px] flex items-center gap-1 px-2 py-1 rounded"
                  style={{ 
                    backgroundColor: "rgba(123, 63, 228, 0.1)",
                    color: "var(--color-primary)" 
                  }}
                >
                  <User className="w-3 h-3" />
                  Tu custodia: {custody.currentUserShare}%
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CoOwnersDisplay;
