/**
 * 🧬 GENOMAD - Agent Card Component
 * Displays an individual agent with their traits
 */

interface AgentDNA {
  social: number;
  technical: number;
  creativity: number;
  analysis: number;
  trading: number;
  empathy: number;
  teaching: number;
  leadership: number;
}

interface AgentCardProps {
  id: string;
  name: string;
  dna: AgentDNA;
  generation: number;
  imageUrl?: string;
}

function TraitBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-20">{label}</span>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-8">{value}</span>
    </div>
  );
}

export function AgentCard({ id, name, dna, generation, imageUrl }: AgentCardProps) {
  const fitness = Object.values(dna).reduce((a, b) => a + b, 0) / 8;
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-purple-500/50 transition">
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-3xl">
          🧬
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white">{name}</h3>
          <p className="text-sm text-gray-400">Gen {generation} • Fitness: {fitness.toFixed(1)}</p>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <TraitBar label="Social" value={dna.social} />
        <TraitBar label="Technical" value={dna.technical} />
        <TraitBar label="Creativity" value={dna.creativity} />
        <TraitBar label="Analysis" value={dna.analysis} />
        <TraitBar label="Trading" value={dna.trading} />
        <TraitBar label="Empathy" value={dna.empathy} />
        <TraitBar label="Teaching" value={dna.teaching} />
        <TraitBar label="Leadership" value={dna.leadership} />
      </div>
      
      <div className="mt-4 flex gap-2">
        <button className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition">
          Breed
        </button>
        <button className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
          Details
        </button>
      </div>
    </div>
  );
}
