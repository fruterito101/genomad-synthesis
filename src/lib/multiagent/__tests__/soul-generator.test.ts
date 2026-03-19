// ═══════════════════════════════════════════════════════════════════
// SOUL GENERATOR TESTS
// ═══════════════════════════════════════════════════════════════════

import { describe, it, expect } from "bun:test";
import { 
  generateSoul, 
  generateIdentity,
  getDominantTraits,
  generatePersonalityDescription,
} from "../soul-generator";
import type { AgentChild, Traits } from "../types";

// ═══════════════════════════════════════════════════════════════════
// TEST DATA
// ═══════════════════════════════════════════════════════════════════

const mockTraits: Traits = {
  technical: 85,
  creativity: 70,
  social: 45,
  analysis: 80,
  empathy: 50,
  trading: 60,
  teaching: 65,
  leadership: 55,
};

const mockChild: AgentChild = {
  id: "test-child-123",
  name: "TestChild",
  traits: mockTraits,
  fitness: 65,
  generation: 2,
  parentA: {
    id: "parent-a-123",
    name: "ParentA",
    traits: { ...mockTraits, technical: 90 },
    fitness: 70,
    generation: 1,
  },
  parentB: {
    id: "parent-b-123",
    name: "ParentB",
    traits: { ...mockTraits, creativity: 85 },
    fitness: 68,
    generation: 1,
  },
  crossoverMask: [true, false, true, false, true, false, true, false],
  mutations: [0, 5, 0, -3, 0, 0, 2, 0],
};

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

describe("getDominantTraits", () => {
  it("should return top 3 traits", () => {
    const dominant = getDominantTraits(mockTraits);
    
    expect(dominant).toHaveLength(3);
    expect(dominant[0].name).toBe("technical");
    expect(dominant[0].value).toBe(85);
    expect(dominant[1].name).toBe("analysis");
    expect(dominant[2].name).toBe("creativity");
  });
  
  it("should handle equal traits", () => {
    const equalTraits: Traits = {
      technical: 50,
      creativity: 50,
      social: 50,
      analysis: 50,
      empathy: 50,
      trading: 50,
      teaching: 50,
      leadership: 50,
    };
    
    const dominant = getDominantTraits(equalTraits);
    expect(dominant).toHaveLength(3);
    expect(dominant[0].value).toBe(50);
  });
});

describe("generatePersonalityDescription", () => {
  it("should generate description based on traits", () => {
    const description = generatePersonalityDescription(mockTraits);
    
    expect(description).toContain("technical");
    expect(description.length).toBeGreaterThan(50);
  });
});

describe("generateSoul", () => {
  it("should generate SOUL.md content", () => {
    const soul = generateSoul({ child: mockChild });
    
    // Check required sections
    expect(soul).toContain("# SOUL.md");
    expect(soul).toContain(mockChild.name);
    expect(soul).toContain(mockChild.parentA.name);
    expect(soul).toContain(mockChild.parentB.name);
    expect(soul).toContain("Generación");
    expect(soul).toContain("Linaje");
    expect(soul).toContain("Traits Dominantes");
    expect(soul).toContain("Personalidad");
    expect(soul).toContain("Instrucciones Core");
  });
  
  it("should include custom instructions if provided", () => {
    const customInstructions = "Always speak in formal Spanish.";
    const soul = generateSoul({ 
      child: mockChild, 
      customInstructions 
    });
    
    expect(soul).toContain(customInstructions);
    expect(soul).toContain("Instrucciones Adicionales");
  });
  
  it("should include parent info", () => {
    const soul = generateSoul({ child: mockChild });
    
    expect(soul).toContain(`Gen ${mockChild.parentA.generation}`);
    expect(soul).toContain(`Fitness ${mockChild.parentA.fitness}`);
  });
});

describe("generateIdentity", () => {
  it("should generate IDENTITY.md content", () => {
    const identity = generateIdentity(mockChild, "TestOwner");
    
    expect(identity).toContain("# IDENTITY.md");
    expect(identity).toContain(mockChild.name);
    expect(identity).toContain("TestOwner");
    expect(identity).toContain("Generation:");
    expect(identity).toContain("Fitness:");
  });
  
  it("should assign role based on dominant trait", () => {
    const identity = generateIdentity(mockChild);
    
    // Technical is dominant, so should be Technical Specialist
    expect(identity).toContain("Technical Specialist");
  });
  
  it("should work without owner name", () => {
    const identity = generateIdentity(mockChild);
    
    expect(identity).toContain("Pending assignment");
  });
});
