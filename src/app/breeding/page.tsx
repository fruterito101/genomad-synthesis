"use client"
import dynamic from "next/dynamic";
import { Dna } from "lucide-react";

// Dynamic import with SSR disabled to avoid WagmiProvider issues during prerender
const BreedingContent = dynamic(
  () => import("./BreedingContent"),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Dna className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse text-primary" />
      </div>
    )
  }
);

export default function BreedingPage() {
  return <BreedingContent />;
}
