// src/components/landing/Breeding.tsx
"use client";

import Link from "next/link";
import { Heart, ArrowRight, Dna, Shuffle, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Shuffle,
    title: "Genetic Crossover",
    description: "Traits are combined using weighted, uniform, or single-point crossover algorithms.",
  },
  {
    icon: TrendingUp,
    title: "Mutation System",
    description: "Random mutations can improve or modify traits, creating unique variations.",
  },
  {
    icon: Dna,
    title: "Lineage Tracking",
    description: "Full family tree stored on-chain. Track ancestry through unlimited generations.",
  },
];

export function Breeding() {
  return (
    <section id="breeding" className="py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Heart className="w-4 h-4 text-accent" />
              <span className="text-sm text-accent">Breeding System</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Create the next generation
            </h2>
            
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Combine two agents to create offspring with inherited traits. 
              Each child has a unique combination of its parents' genetics, 
              plus potential mutations that could create superior agents.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-0.5">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/breeding"
              className="btn-primary inline-flex items-center gap-2"
            >
              Start Breeding
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="card p-8">
              {/* Breeding diagram */}
              <div className="flex items-center justify-center gap-4 mb-8">
                {/* Parent A */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <span className="text-2xl">🧬</span>
                </div>
                
                {/* Plus */}
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-accent" />
                </div>
                
                {/* Parent B */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center">
                  <span className="text-2xl">🧬</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-8">
                <div className="w-px h-12 bg-gradient-to-b from-border to-primary/50" />
              </div>

              {/* Offspring */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/20 border border-primary/30 flex items-center justify-center glow">
                  <span className="text-3xl">✨</span>
                </div>
              </div>

              {/* Labels */}
              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  Offspring inherits traits from both parents
                </p>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Breeding;
