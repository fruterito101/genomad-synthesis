// src/components/landing/HowToStart.tsx
"use client";

import { Wallet, Bot, Dna, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    step: "01",
    title: "Connect Wallet",
    description: "Link your wallet using Privy. We support MetaMask, Coinbase, and other popular wallets.",
  },
  {
    icon: Bot,
    step: "02",
    title: "Register Agent",
    description: "Create your AI agent with unique traits. Each trait is a number from 0-100 defining your agent's DNA.",
  },
  {
    icon: Dna,
    step: "03",
    title: "Activate On-Chain",
    description: "Mint your agent as an NFT on Base. This creates a permanent, verifiable record of your agent's genetics.",
  },
  {
    icon: Sparkles,
    step: "04",
    title: "Breed & Evolve",
    description: "Combine agents to create offspring with inherited traits. Watch your lineage grow through generations.",
  },
];

export function HowToStart() {
  return (
    <section className="py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How to get started
          </h2>
          <p className="text-muted-foreground text-lg">
            Four simple steps to bring your AI agent to life on-chain
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(100%+12px)] w-[calc(100%-48px)] h-px bg-border" />
              )}
              
              <div className="card p-6 h-full">
                {/* Step number */}
                <span className="text-xs font-mono text-primary mb-4 block">
                  {step.step}
                </span>
                
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowToStart;
