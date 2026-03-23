// src/components/landing/Hero.tsx
"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  const { login, authenticated } = usePrivy();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-50" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">Live on Base Mainnet</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          <span className="gradient-text">Evolve</span> your
          <br />
          AI agents on-chain
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Genomad is a genetic protocol for AI agents. Register, breed, and evolve 
          your agents with verifiable on-chain traits and lineage.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {authenticated ? (
            <Link href="/dashboard" className="btn-primary flex items-center gap-2 text-base">
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button onClick={login} className="btn-primary flex items-center gap-2 text-base">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <Link href="#how-it-works" className="btn-secondary text-base">
            Learn more
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-20 max-w-lg mx-auto">
          <div>
            <div className="text-3xl font-bold gradient-text">6+</div>
            <div className="text-sm text-muted-foreground mt-1">Agents Minted</div>
          </div>
          <div>
            <div className="text-3xl font-bold gradient-text">4</div>
            <div className="text-sm text-muted-foreground mt-1">Smart Contracts</div>
          </div>
          <div>
            <div className="text-3xl font-bold gradient-text">8</div>
            <div className="text-sm text-muted-foreground mt-1">Trait Types</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
