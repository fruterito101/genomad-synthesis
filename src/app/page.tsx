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
    <main style={{ backgroundColor: 'var(--color-bg-primary)' }}>
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
