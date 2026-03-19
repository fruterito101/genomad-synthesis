// src/app/page.tsx
// Landing Page - Genomad

import { 
  Header, 
  Hero, 
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
      <WhatIsGenomad />
      <AgentsCatalogue />
      <HowToStart />
      <Breeding />
      <Footer />
    </main>
  );
}
