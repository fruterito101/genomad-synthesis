// src/app/agents/page.tsx
import { Suspense } from "react";
import AgentsCatalog from "./AgentsCatalog";
import { AppHeader } from "@/components/AppHeader";
import { Dna } from "lucide-react";
import { getDb } from "@/lib/db/client";
import { agents } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Agent {
  id: string;
  name: string;
  botUsername: string | null;
  traits: Record<string, number>;
  fitness: number;
  generation: number;
  isActive: boolean;
}

// Direct database query - no HTTP fetch needed
async function getAgents(): Promise<Agent[]> {
  try {
    const db = getDb();
    
    const allAgents = await db
      .select({
        id: agents.id,
        name: agents.name,
        botUsername: agents.botUsername,
        fitness: agents.fitness,
        generation: agents.generation,
        isActive: agents.isActive,
        traits: agents.traits,
      })
      .from(agents)
      .orderBy(desc(agents.fitness))
      .limit(50);

    const defaultTraits = {
      technical: 50, creativity: 50, social: 50, analysis: 50,
      empathy: 50, trading: 50, teaching: 50, leadership: 50,
    };

    return allAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      botUsername: agent.botUsername,
      fitness: agent.fitness,
      generation: agent.generation,
      isActive: agent.isActive,
      traits: (agent.traits && typeof agent.traits === 'object' && Object.keys(agent.traits).length > 0) 
        ? agent.traits as Record<string, number>
        : defaultTraits,
    }));
  } catch (error) {
    console.error("[AgentsPage] DB error:", error);
    return [];
  }
}

function LoadingState() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="text-center py-12">
          <Dna className="w-12 h-12 mx-auto animate-pulse" style={{ color: "var(--color-primary)" }} />
          <p className="mt-4 text-sm" style={{ color: "var(--color-text-muted)" }}>Cargando agentes...</p>
        </div>
      </main>
    </div>
  );
}

export default async function AgentsPage() {
  const agentsList = await getAgents();
  
  return (
    <Suspense fallback={<LoadingState />}>
      <AgentsCatalog initialAgents={agentsList} />
    </Suspense>
  );
}
