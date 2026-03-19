// src/app/agents/page.tsx
import { Suspense } from "react";
import AgentsCatalog from "./AgentsCatalog";
import { AppHeader } from "@/components/AppHeader";
import { Dna } from "lucide-react";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Server-side data fetching
async function getAgents() {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    const res = await fetch(`${baseUrl}/api/leaderboard?limit=50`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    });
    
    if (!res.ok) {
      console.error("[AgentsPage] Server fetch failed:", res.status);
      return [];
    }
    
    const data = await res.json();
    console.log("[AgentsPage] Server fetched agents:", data.agents?.length || 0);
    return data.agents || [];
  } catch (error) {
    console.error("[AgentsPage] Server fetch error:", error);
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
  const agents = await getAgents();
  
  return (
    <Suspense fallback={<LoadingState />}>
      <AgentsCatalog initialAgents={agents} />
    </Suspense>
  );
}
