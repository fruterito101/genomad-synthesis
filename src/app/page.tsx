"use client"
// src/app/page.tsx
// Landing Page - Genomad

import dynamic from "next/dynamic";
import { 
  Header, 
  Hero, 
  WhatIsGenomad, 
  AgentsCatalogue, 
  HowToStart, 
  Breeding, 
  Footer 
} from "@/components/landing";

// Lazy load heavy components
const InteractiveGlobe = dynamic(
  () => import("@/components/interactive-globe").then(mod => ({ default: mod.InteractiveGlobe })),
  { 
    ssr: false,
    loading: () => (
      <section className="w-full py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 animate-pulse">
              <div className="h-6 w-32 bg-muted rounded" />
              <div className="h-12 w-64 bg-muted rounded" />
              <div className="h-20 w-full bg-muted rounded" />
            </div>
            <div className="aspect-square max-w-[500px] mx-auto bg-muted/20 rounded-full animate-pulse" />
          </div>
        </div>
      </section>
    )
  }
);

export default function Home() {
  return (
    <main className="bg-background">
      <Header />
      <Hero />
      <InteractiveGlobe className="border-t border-border" />
      <WhatIsGenomad />
      <AgentsCatalogue />
      <HowToStart />
      <Breeding />
      <Footer />
    </main>
  );
}
