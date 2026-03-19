"use client";

import { useNetwork, Network } from "@/contexts/NetworkContext";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, TestTube, Sparkles, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function NetworkSwitcher() {
  const { network, switchNetwork, isTestnet } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitch = (newNetwork: Network) => {
    if (newNetwork !== network) {
      switchNetwork(newNetwork);
      // Reload to reinitialize providers
      window.location.reload();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
          transition-colors border
          ${isTestnet 
            ? "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20" 
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
          }
        `}
        whileTap={{ scale: 0.95 }}
      >
        {isTestnet ? (
          <TestTube className="w-3.5 h-3.5" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">{isTestnet ? "Testnet" : "Mainnet"}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-border bg-card shadow-xl z-50"
          >
            <div className="p-1">
              <button
                onClick={() => handleSwitch("testnet")}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm
                  transition-colors
                  ${isTestnet 
                    ? "bg-amber-500/20 text-amber-500" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <TestTube className="w-4 h-4" />
                <span>Testnet</span>
                {isTestnet && <span className="ml-auto text-xs">✓</span>}
              </button>
              <button
                onClick={() => handleSwitch("mainnet")}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm
                  transition-colors
                  ${!isTestnet 
                    ? "bg-emerald-500/20 text-emerald-500" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <Sparkles className="w-4 h-4" />
                <span>Mainnet</span>
                {!isTestnet && <span className="ml-auto text-xs">✓</span>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
