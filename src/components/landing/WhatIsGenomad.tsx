// src/components/landing/WhatIsGenomad.tsx
"use client";

import { Dna, Cpu, GitBranch, Shield } from "lucide-react";

const features = [
  {
    icon: Dna,
    title: "Genetic Traits",
    description: "8 unique traits define each agent's DNA. Technical, Creativity, Social, Analysis, Empathy, Trading, Teaching, Leadership.",
  },
  {
    icon: GitBranch,
    title: "On-Chain Breeding",
    description: "Combine two agents to create offspring with inherited and mutated traits. Full lineage tracking on Base.",
  },
  {
    icon: Cpu,
    title: "AI Integration",
    description: "Connect real AI agents via Telegram bots. Your agent's personality is shaped by its genetic traits.",
  },
  {
    icon: Shield,
    title: "Verifiable Proofs",
    description: "Zero-knowledge proofs verify trait validity without revealing the actual values. Privacy by design.",
  },
];

export function WhatIsGenomad() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What is <span className="gradient-text">Genomad</span>?
          </h2>
          <p className="text-muted-foreground text-lg">
            A protocol that brings genetic evolution to AI agents. Each agent has unique DNA 
            that can be verified, bred, and evolved on-chain.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="card p-6 group hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhatIsGenomad;
