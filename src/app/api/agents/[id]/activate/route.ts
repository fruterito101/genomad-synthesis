// ═══════════════════════════════════════════════════════════════════
// ACTIVATE AGENT API
// POST /api/agents/{id}/activate - Activates agent in OpenClaw
// DELETE /api/agents/{id}/activate - Deactivates agent
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { 
  provisionWorkspace, 
  deprovisionWorkspace,
  getAgentWorkspacePath,
} from "@/lib/multiagent/workspace-provisioner";
import { 
  addAgentToConfig, 
  removeAgentFromConfig,
} from "@/lib/multiagent/config-manager";
import {
  reloadGateway,
  getGatewayStatus,
  isOpenClawAvailable,
} from "@/lib/multiagent/gateway-reload";
import type { ActivationResult, ActivationStep, AgentChild } from "@/lib/multiagent/types";

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function createStep(name: string): ActivationStep {
  return { name, status: "pending" };
}

function updateStep(
  step: ActivationStep, 
  status: "running" | "success" | "failed",
  message?: string
): void {
  step.status = status;
  if (message) step.message = message;
}

// ═══════════════════════════════════════════════════════════════════
// POST - Activate Agent
// ═══════════════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const steps: ActivationStep[] = [];
  
  try {
    // Step 1: Get agent from DB
    const step1 = createStep("Fetch agent data");
    steps.push(step1);
    updateStep(step1, "running");
    
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);
    
    if (!agent) {
      updateStep(step1, "failed", "Agent not found");
      return NextResponse.json(
        { success: false, error: "Agent not found", steps },
        { status: 404 }
      );
    }
    
    updateStep(step1, "success");
    
    // Step 2: Get parent data if bred
    const step2 = createStep("Fetch parent data");
    steps.push(step2);
    updateStep(step2, "running");
    
    let parentA = null;
    let parentB = null;
    
    if (agent.parentAId && agent.parentBId) {
      const parents = await db
        .select()
        .from(agents)
        .where(eq(agents.id, agent.parentAId))
        .limit(1);
      
      const parentsB = await db
        .select()
        .from(agents)
        .where(eq(agents.id, agent.parentBId))
        .limit(1);
      
      parentA = parents[0] || null;
      parentB = parentsB[0] || null;
    }
    
    updateStep(step2, "success");
    
    // Build child object for soul generation
    const childData: AgentChild = {
      id: agent.id,
      name: agent.name,
      traits: agent.traits as any,
      fitness: agent.fitness,
      generation: agent.generation,
      parentA: parentA ? {
        id: parentA.id,
        name: parentA.name,
        traits: parentA.traits as any,
        fitness: parentA.fitness,
        generation: parentA.generation,
      } : {
        id: "genesis",
        name: "Genesis",
        traits: { technical: 50, creativity: 50, social: 50, analysis: 50, empathy: 50, trading: 50, teaching: 50, leadership: 50 },
        fitness: 50,
        generation: 0,
      },
      parentB: parentB ? {
        id: parentB.id,
        name: parentB.name,
        traits: parentB.traits as any,
        fitness: parentB.fitness,
        generation: parentB.generation,
      } : {
        id: "genesis",
        name: "Genesis",
        traits: { technical: 50, creativity: 50, social: 50, analysis: 50, empathy: 50, trading: 50, teaching: 50, leadership: 50 },
        fitness: 50,
        generation: 0,
      },
      crossoverMask: [true, false, true, false, true, false, true, false],
      mutations: [0, 0, 0, 0, 0, 0, 0, 0],
    };
    
    // Step 3: Provision workspace
    const step3 = createStep("Provision workspace");
    steps.push(step3);
    updateStep(step3, "running");
    
    const workspaceResult = provisionWorkspace(childData, "Owner");
    
    if (!workspaceResult.success) {
      updateStep(step3, "failed", workspaceResult.error);
      return NextResponse.json(
        { success: false, error: workspaceResult.error, steps },
        { status: 500 }
      );
    }
    
    updateStep(step3, "success", `Created at ${workspaceResult.path}`);
    
    // Step 4: Add to OpenClaw config
    const step4 = createStep("Update OpenClaw config");
    steps.push(step4);
    updateStep(step4, "running");
    
    const workspacePath = getAgentWorkspacePath(agent.id) + "/workspace";
    const configResult = addAgentToConfig(agent.id, workspacePath);
    
    if (!configResult.success) {
      // Rollback workspace
      deprovisionWorkspace(agent.id);
      updateStep(step4, "failed", configResult.error);
      return NextResponse.json(
        { success: false, error: configResult.error, steps },
        { status: 500 }
      );
    }
    
    updateStep(step4, "success");
    
    // Step 5: Reload Gateway (if available)
    const step5 = createStep("Reload OpenClaw gateway");
    steps.push(step5);
    updateStep(step5, "running");
    
    const openclawAvailable = await isOpenClawAvailable();
    
    if (openclawAvailable) {
      const gatewayStatus = await getGatewayStatus();
      
      if (gatewayStatus.running) {
        const reloadResult = await reloadGateway();
        
        if (reloadResult.success) {
          updateStep(step5, "success", reloadResult.message);
        } else {
          updateStep(step5, "failed", reloadResult.error);
          // Don't fail activation - gateway reload is optional
        }
      } else {
        updateStep(step5, "success", "Gateway not running - skip reload");
      }
    } else {
      updateStep(step5, "success", "OpenClaw CLI not available - skip reload");
    }
    
    // Step 6: Update DB status
    const step6 = createStep("Update database");
    steps.push(step6);
    updateStep(step6, "running");
    
    await db
      .update(agents)
      .set({ 
        isActive: true,
        activatedAt: new Date(),
      })
      .where(eq(agents.id, id));
    
    updateStep(step6, "success");
    
    // Return success
    const result: ActivationResult = {
      success: true,
      agentId: id,
      workspacePath: workspaceResult.path,
      steps,
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        steps,
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// DELETE - Deactivate Agent
// ═══════════════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const steps: ActivationStep[] = [];
  
  try {
    // Step 1: Verify agent exists
    const step1 = createStep("Verify agent");
    steps.push(step1);
    updateStep(step1, "running");
    
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);
    
    if (!agent) {
      updateStep(step1, "failed", "Agent not found");
      return NextResponse.json(
        { success: false, error: "Agent not found", steps },
        { status: 404 }
      );
    }
    
    updateStep(step1, "success");
    
    // Step 2: Remove from OpenClaw config
    const step2 = createStep("Remove from OpenClaw config");
    steps.push(step2);
    updateStep(step2, "running");
    
    const configResult = removeAgentFromConfig(id);
    
    if (!configResult.success) {
      updateStep(step2, "failed", configResult.error);
      // Continue anyway
    } else {
      updateStep(step2, "success");
    }
    
    // Step 3: Reload Gateway
    const step3 = createStep("Reload OpenClaw gateway");
    steps.push(step3);
    updateStep(step3, "running");
    
    const openclawAvailable = await isOpenClawAvailable();
    
    if (openclawAvailable) {
      const gatewayStatus = await getGatewayStatus();
      
      if (gatewayStatus.running) {
        const reloadResult = await reloadGateway();
        updateStep(step3, reloadResult.success ? "success" : "failed", 
          reloadResult.success ? reloadResult.message : reloadResult.error);
      } else {
        updateStep(step3, "success", "Gateway not running");
      }
    } else {
      updateStep(step3, "success", "OpenClaw CLI not available");
    }
    
    // Step 4: Deprovision workspace
    const step4 = createStep("Remove workspace");
    steps.push(step4);
    updateStep(step4, "running");
    
    const deprovisionResult = deprovisionWorkspace(id);
    
    if (!deprovisionResult.success) {
      updateStep(step4, "failed", deprovisionResult.error);
    } else {
      updateStep(step4, "success");
    }
    
    // Step 5: Update DB
    const step5 = createStep("Update database");
    steps.push(step5);
    updateStep(step5, "running");
    
    await db
      .update(agents)
      .set({ 
        isActive: false,
        activatedAt: null,
      })
      .where(eq(agents.id, id));
    
    updateStep(step5, "success");
    
    return NextResponse.json({
      success: true,
      agentId: id,
      steps,
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        steps,
      },
      { status: 500 }
    );
  }
}
