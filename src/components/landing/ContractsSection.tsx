// src/components/landing/ContractsSection.tsx
"use client";

import { ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";

const contracts = [
  {
    name: "GenomadNFT",
    address: "0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0",
    description: "ERC-721 NFT contract for agent registration and ownership",
  },
  {
    name: "BreedingFactory",
    address: "0x74Bb441677b6E7de0d1FF75e0a3F766f5e8470db",
    description: "Handles breeding requests and offspring creation",
  },
  {
    name: "TraitVerifier",
    address: "0x99D2090a76a1f3cfe79F6Fb3A01F7F23C0ECce7F",
    description: "ZK proof verification for trait validation",
  },
  {
    name: "ReputationRegistry",
    address: "0x3F6A5E4778c905d36BD433DBaD06C7f70D630E71",
    description: "Stores feedback and reputation scores",
  },
];

export function ContractsSection() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyAddress = (address: string, index: number) => {
    navigator.clipboard.writeText(address);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section className="py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Smart Contracts
            </h2>
            <p className="text-muted-foreground">
              Deployed and verified on Base Mainnet
            </p>
          </div>
          <a
            href="https://basescan.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View on BaseScan
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Contracts List */}
        <div className="space-y-4">
          {contracts.map((contract, i) => (
            <div
              key={i}
              className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{contract.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {contract.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs md:text-sm font-mono text-muted-foreground bg-muted/50 px-3 py-1.5 rounded">
                  {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                </code>
                <button
                  onClick={() => copyAddress(contract.address, i)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Copy address"
                >
                  {copiedIndex === i ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <a
                  href={`https://basescan.org/address/${contract.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="View on BaseScan"
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ContractsSection;
