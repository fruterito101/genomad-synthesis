// src/app/page.tsx
// Landing Page - Genomad (Clean Redesign)

import { 
  Header, 
  Hero,
  VideoSection,
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
      <VideoSection />
      <WhatIsGenomad />
      <ContractsSection />
      <AgentsCatalogue />
      <HowToStart />
      <Breeding />
      <Footer />
    </main>
  );
}
