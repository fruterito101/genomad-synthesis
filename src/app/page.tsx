// src/app/page.tsx
// Landing Page - Genomad (Clean Redesign)

import { 
  Header, 
  Hero, 
  WhatIsGenomad,
  ContractsSection,
  AgentsCatalogue, 
  HowToStart, 
  Breeding, 
  Footer 
} from "@/components/landing";

export default function Home() {
  return (
    <main className="bg-background min-h-screen">
      <Header />
      <Hero />
      <WhatIsGenomad />
      <ContractsSection />
      <AgentsCatalogue />
      <HowToStart />
      <Breeding />
      <Footer />
    </main>
  );
}
