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
import { getDb } from "@/lib/db/client";
import { agents } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Server-side data fetch
async function getAgents() {
  try {
    const db = getDb();
    const allAgents = await db
      .select({
        id: agents.id,
        name: agents.name,
        fitness: agents.fitness,
        generation: agents.generation,
        isActive: agents.isActive,
        traits: agents.traits,
      })
      .from(agents)
      .orderBy(desc(agents.fitness))
      .limit(50);

    return allAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      fitness: agent.fitness,
      generation: agent.generation,
      isActive: agent.isActive,
      traits: (agent.traits && typeof agent.traits === 'object') 
        ? agent.traits as Record<string, number>
        : { technical: 50, creativity: 50, social: 50, analysis: 50, empathy: 50, trading: 50, teaching: 50, leadership: 50 },
    }));
  } catch (error) {
    console.error("[Landing] DB error:", error);
    return [];
  }
}

export default async function Home() {
  const agentsList = await getAgents();
  
  return (
    <main style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <Header />
      <Hero />
      <WhatIsGenomad />
      <AgentsCatalogue initialAgents={agentsList} />
      <HowToStart />
      <Breeding />
      <Footer />
    </main>
  );
}
