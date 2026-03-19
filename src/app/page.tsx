// src/app/page.tsx
// Landing Page - Genomad

import { 
  Header, 
  Hero, 
  InteractiveGlobe,
  WhatIsGenomad, 
  AgentsCatalogue, 
  HowToStart, 
  Breeding, 
  Footer 
} from "@/components/landing";

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
