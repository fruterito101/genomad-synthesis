"use client";

import { ExternalLink, CheckCircle2, Shield, Code2, Star } from "lucide-react";

const contracts = [
  {
    name: "GenomadNFT",
    address: "0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0",
    description: "ERC-8004 compliant agent identity NFT",
    features: ["agentURI", "metadata", "agentWallet", "custody"],
    icon: "shield"
  },
  {
    name: "BreedingFactory", 
    address: "0x74Bb441677b6E7de0d1FF75e0a3F766f5e8470db",
    description: "Agent breeding with genetic crossover",
    features: ["crossover", "mutation", "custody split"],
    icon: "code"
  },
  {
    name: "TraitVerifier",
    address: "0x99D2090a76a1f3cfe79F6Fb3A01F7F23C0ECce7F", 
    description: "ZK proof verification on-chain",
    features: ["trait proofs", "breed proofs", "privacy"],
    icon: "check"
  },
  {
    name: "ReputationRegistry",
    address: "0x3F6A5E4778c905d36BD433DBaD06C7f70D630E71",
    description: "ERC-8004 reputation system for agents",
    features: ["feedback", "ratings", "trust scores"],
    icon: "star"
  }
];

export function ContractsSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm mb-4">
            <CheckCircle2 className="w-4 h-4" />
            Live on Base Mainnet
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ERC-8004 Contracts
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Fully deployed and verified smart contracts implementing the 
            <a href="https://eips.ethereum.org/EIPS/eip-8004" target="_blank" rel="noopener" className="text-primary hover:underline ml-1">
              ERC-8004 Trustless Agents
            </a> standard.
          </p>
        </div>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contracts.map((contract) => (
            <div 
              key={contract.name}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  {contract.icon === "shield" && <Shield className="w-5 h-5 text-primary" />}
                  {contract.icon === "code" && <Code2 className="w-5 h-5 text-primary" />}
                  {contract.icon === "check" && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  {contract.icon === "star" && <Star className="w-5 h-5 text-primary" />}
                </div>
                <h3 className="font-semibold text-lg">{contract.name}</h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {contract.description}
              </p>

              {/* Address */}
              <a
                href={`https://basescan.org/address/${contract.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-mono bg-muted/50 rounded-lg px-3 py-2 hover:bg-muted transition-colors mb-4"
              >
                <span className="truncate">{contract.address}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {contract.features.map((feature) => (
                  <span 
                    key={feature}
                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Chain Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 text-sm text-muted-foreground flex-wrap justify-center">
            <span>Chain: <span className="text-foreground font-medium">Base Mainnet</span></span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground hidden sm:block" />
            <span>Chain ID: <span className="text-foreground font-medium">8453</span></span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground hidden sm:block" />
            <span>Contracts: <span className="text-foreground font-medium">4</span></span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground hidden sm:block" />
            <a 
              href="https://basescan.org/address/0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0"
              target="_blank"
              rel="noopener"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              View on BaseScan <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
