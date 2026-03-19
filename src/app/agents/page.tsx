// src/app/agents/page.tsx
import { Suspense } from "react";
import AgentsCatalog from "./AgentsCatalog";
import { AppHeader } from "@/components/AppHeader";
import { AgentListLoading, ErrorState } from "@/components/FallbackUI";
import { Dna } from "lucide-react";
import { getDb } from "@/lib/db/client";
import { agents } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { sanitizeAgentList } from "@/lib/utils/agent-validation";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🛡️ Safe database query with error handling
async function getAgents() {
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
        isSuspicious: agents.isSuspicious,
        traits: agents.traits,
      })
      .from(agents)
      .where(eq(agents.isSuspicious, false)) // 🛡️ No mostrar sospechosos
      .orderBy(desc(agents.fitness))
      .limit(100);

    // 🛡️ Sanitizar antes de enviar al cliente
    return sanitizeAgentList(allAgents);
    
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
        <div className="text-center mb-8">
          <Dna className="w-12 h-12 mx-auto animate-pulse" style={{ color: "var(--color-primary)" }} />
          <p className="mt-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Cargando agentes...
          </p>
        </div>
        <AgentListLoading count={8} />
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
