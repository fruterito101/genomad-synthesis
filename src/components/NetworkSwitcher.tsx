"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, TestTube, Rocket, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

type Network = "testnet" | "mainnet";

interface NetworkConfig {
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const NETWORKS: Record<Network, NetworkConfig> = {
  testnet: {
    name: "Testnet",
    icon: TestTube,
    color: "text-orange-400",
    bgColor: "bg-orange-500/15",
    borderColor: "border-orange-500/30",
  },
  mainnet: {
    name: "Mainnet",
    icon: Rocket,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/15",
    borderColor: "border-emerald-500/30",
  },
};

export function NetworkSwitcher() {
  const { t } = useTranslation();
  const [network, setNetwork] = useState<Network>("testnet");
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  // Load initial network from localStorage or env
  useEffect(() => {
    const savedNetwork = localStorage.getItem("genomad-network") as Network;
    if (savedNetwork && (savedNetwork === "testnet" || savedNetwork === "mainnet")) {
      setNetwork(savedNetwork);
    }
  }, []);

  const handleNetworkChange = async (newNetwork: Network) => {
    if (newNetwork === network) {
      setIsOpen(false);
      return;
    }

    setIsChanging(true);
    
    // Save to localStorage
    localStorage.setItem("genomad-network", newNetwork);
    
    // Update state
    setNetwork(newNetwork);
    setIsOpen(false);

    // Reload page to apply new network config
    // In production, this would trigger a context update
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const currentNetwork = NETWORKS[network];
  const CurrentIcon = currentNetwork.icon;

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
            className="absolute right-0 top-full mt-2 z-50 min-w-[160px] bg-background/95 backdrop-blur-xl border border-border rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-1">
              {(Object.entries(NETWORKS) as [Network, NetworkConfig][]).map(([key, config]) => {
                const Icon = config.icon;
                const isActive = key === network;
                
                return (
                  <button
                    key={key}
                    onClick={() => handleNetworkChange(key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
                      isActive 
                        ? `${config.bgColor} ${config.color}` 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{config.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="network-indicator"
                        className={`ml-auto w-2 h-2 rounded-full ${config.color.replace("text-", "bg-")}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Info footer */}
            <div className="px-3 py-2 border-t border-border bg-muted/50">
              <p className="text-xs text-muted-foreground">
                {network === "testnet" 
                  ? "🧪 Testing environment" 
                  : "🚀 Production network"}
              </p>
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
            <p className="text-sm text-muted-foreground">Switching network...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default NetworkSwitcher;
