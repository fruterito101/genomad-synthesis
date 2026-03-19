"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, TestTube, Rocket, ChevronDown, ExternalLink } from "lucide-react";
import { useNetwork, Network } from "@/contexts/NetworkContext";

interface NetworkConfig {
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  badge: string;
}

const NETWORKS: Record<Network, NetworkConfig> = {
  testnet: {
    name: "Testnet",
    icon: TestTube,
    color: "text-orange-400",
    bgColor: "bg-orange-500/15",
    borderColor: "border-orange-500/30",
    badge: "🧪",
  },
  mainnet: {
    name: "Mainnet",
    icon: Rocket,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/15",
    borderColor: "border-emerald-500/30",
    badge: "🚀",
  },
};

export function NetworkSwitcher() {
  const { network, switchNetwork, contracts, explorerUrl } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const handleNetworkChange = async (newNetwork: Network) => {
    if (newNetwork === network) {
      setIsOpen(false);
      return;
    }

    setIsChanging(true);
    setIsOpen(false);
    
    // Switch network in context
    switchNetwork(newNetwork);

    // Small delay for visual feedback, then reload to reinitialize providers
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const currentNetwork = NETWORKS[network];
  const CurrentIcon = currentNetwork.icon;

  // Check if mainnet has contracts configured
  const mainnetReady = Boolean(
    process.env.NEXT_PUBLIC_MAINNET_GENOMAD_NFT || 
    contracts.genomadNFT // Will be empty string if not set
  );

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${currentNetwork.bgColor} ${currentNetwork.borderColor} hover:opacity-90`}
        whileTap={{ scale: 0.98 }}
        disabled={isChanging}
      >
        <CurrentIcon className={`w-4 h-4 ${currentNetwork.color}`} />
        <span className={`text-sm font-medium ${currentNetwork.color}`}>
          {currentNetwork.name}
        </span>
        <ChevronDown 
          className={`w-3 h-3 ${currentNetwork.color} transition-transform ${isOpen ? "rotate-180" : ""}`} 
        />
      </motion.button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 z-50 min-w-[200px] bg-background/95 backdrop-blur-xl border border-border rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-1">
              {(Object.entries(NETWORKS) as [Network, NetworkConfig][]).map(([key, config]) => {
                const Icon = config.icon;
                const isActive = key === network;
                const isDisabled = key === "mainnet" && !mainnetReady;
                
                return (
                  <button
                    key={key}
                    onClick={() => !isDisabled && handleNetworkChange(key)}
                    disabled={isDisabled}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
                      isDisabled 
                        ? "opacity-50 cursor-not-allowed text-muted-foreground"
                        : isActive 
                          ? `${config.bgColor} ${config.color}` 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium">{config.name}</span>
                      {isDisabled && (
                        <span className="block text-xs opacity-70">Coming soon</span>
                      )}
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="network-indicator"
                        className={`w-2 h-2 rounded-full ${config.color.replace("text-", "bg-")}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Contract Info */}
            <div className="px-3 py-2 border-t border-border bg-muted/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {currentNetwork.badge} {network === "testnet" ? "Test environment" : "Production"}
                </p>
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Explorer <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {contracts.genomadNFT && (
                <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono truncate">
                  NFT: {contracts.genomadNFT.slice(0, 10)}...
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Loading overlay */}
      {isChanging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="text-center">
            <Globe className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Switching to {NETWORKS[network === "testnet" ? "mainnet" : "testnet"].name}...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default NetworkSwitcher;
