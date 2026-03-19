/**
 * 🧬 GENOMAD - Breeding Lab Component
 * Interface for breeding two agents
 */

'use client';

import { useState } from 'react';

interface Agent {
  id: string;
  name: string;
}

export function BreedingLab() {
  const [parentA, setParentA] = useState<Agent | null>(null);
  const [parentB, setParentB] = useState<Agent | null>(null);
  const [isBreeding, setIsBreeding] = useState(false);
  
  const handleBreed = async () => {
    if (!parentA || !parentB) return;
    setIsBreeding(true);
    // TODO: Call breeding API
    setTimeout(() => setIsBreeding(false), 2000);
  };
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span>🧬</span> Breeding Lab
      </h2>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Parent A Slot */}
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px]">
          {parentA ? (
            <div className="text-center">
              <div className="text-4xl mb-2">🧬</div>
              <p className="font-bold text-white">{parentA.name}</p>
            </div>
          ) : (
            <p className="text-gray-500">Select Parent A</p>
          )}
        </div>
        
        {/* Breed Button */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-4xl mb-4">💕</div>
          <button
            onClick={handleBreed}
            disabled={!parentA || !parentB || isBreeding}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition"
          >
            {isBreeding ? 'Breeding...' : 'Create Child'}
          </button>
        </div>
        
        {/* Parent B Slot */}
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px]">
          {parentB ? (
            <div className="text-center">
              <div className="text-4xl mb-2">🧬</div>
              <p className="font-bold text-white">{parentB.name}</p>
            </div>
          ) : (
            <p className="text-gray-500">Select Parent B</p>
          )}
        </div>
      </div>
    </div>
  );
}
