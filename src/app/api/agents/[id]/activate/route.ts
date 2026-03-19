// ═══════════════════════════════════════════════════════════════════
// ACTIVATE AGENT API
// POST /api/agents/{id}/activate - Activates agent via relay or local
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
import {
  isUserConnected,
  sendProvisionAgent,
  sendDeprovisionAgent,
} from "@/lib/relay";
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
    // Get userId from request body (passed by frontend)
    const body = await request.json().catch(() => ({}));
    const userId = body.userId;
    
    // Step 1: Get agent from DB
    const step1 = createStep("Fetch agent data");
    steps.push(step1);
    updateStep(step1, "running");
    
    const agent = await db.query.agents.findFirst({
      where: eq(agents.id, id),
      with: {
        parentA: true,
        parentB: true,
      },
    });
    
    if (!agent) {
      updateStep(step1, "failed", "Agent not found");
      return NextResponse.json(
        { success: false, error: "Agent not found", steps },
        { status: 404 }
      );
    }
    
    updateStep(step1, "success");
    
    // Step 2: Check relay connection
    const step2 = createStep("Check relay connection");
    steps.push(step2);
    updateStep(step2, "running");
    
    const hasRelayConnection = userId ? isUserConnected(userId) : false;
    const localOpenClawAvailable = await isOpenClawAvailable();
    
    if (hasRelayConnection) {
      updateStep(step2, "success", "User connected via relay");
    } else if (localOpenClawAvailable) {
      updateStep(step2, "success", "Local OpenClaw available");
    } else {
      updateStep(step2, "failed", "No connection available");
      return NextResponse.json(
        { 
          success: false, 
          error: "No OpenClaw connection. Connect your OpenClaw via the relay or run it locally.",
          code: "NO_CONNECTION",
          steps 
        },
        { status: 400 }
      );
    }
    
    // Route to appropriate activation method
    if (hasRelayConnection) {
      return activateViaRelay(id, userId!, agent, steps);
    } else {
      return activateLocally(id, agent, steps);
    }
    
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
// RELAY ACTIVATION
// ═══════════════════════════════════════════════════════════════════

async function activateViaRelay(
  id: string,
  userId: string,
  agent: any,
  steps: ActivationStep[]
): Promise<NextResponse> {
  // Step 3: Send provision command via relay
  const step3 = createStep("Send provision command");
  steps.push(step3);
  updateStep(step3, "running");
  
  try {
    const sent = await sendProvisionAgent(userId, id);
    
    if (!sent) {
      updateStep(step3, "failed", "Failed to send provision command");
      return NextResponse.json(
        { success: false, error: "Failed to send provision command", steps },
        { status: 500 }
      );
    }
    
    updateStep(step3, "success", "Provision command sent to client");
    
    // Step 4: Update DB - mark as activating (will be updated when client confirms)
    const step4 = createStep("Update database");
    steps.push(step4);
    updateStep(step4, "running");
    
    await db
      .update(agents)
      .set({ 
        isActive: true,
        activatedAt: new Date(),
      })
      .where(eq(agents.id, id));
    
    updateStep(step4, "success");
    
    // Return success - note: actual provisioning happens async on client
    const result: ActivationResult = {
      success: true,
      agentId: id,
      steps,
    };
    
    return NextResponse.json({
      ...result,
      message: "Agent activation started. Provisioning on your OpenClaw...",
      activationMethod: "relay",
    });
    
  } catch (error) {
    updateStep(step3, "failed", String(error));
    return NextResponse.json(
      { success: false, error: String(error), steps },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// LOCAL ACTIVATION (Original logic)
// ═══════════════════════════════════════════════════════════════════

async function activateLocally(
  id: string,
  agent: any,
  steps: ActivationStep[]
): Promise<NextResponse> {
  // Build child object for soul generation
  const childData: AgentChild = {
    id: agent.id,
    name: agent.name,
    traits: agent.traits as any,
    fitness: agent.fitness,
    generation: agent.generation,
    parentA: agent.parentA ? {
      id: agent.parentA.id,
      name: agent.parentA.name,
      traits: agent.parentA.traits as any,
      fitness: agent.parentA.fitness,
      generation: agent.parentA.generation,
    } : {
      id: "genesis",
      name: "Genesis",
      traits: { technical: 50, creativity: 50, social: 50, analysis: 50, empathy: 50, trading: 50, teaching: 50, leadership: 50 },
      fitness: 50,
      generation: 0,
    },
    parentB: agent.parentB ? {
      id: agent.parentB.id,
      name: agent.parentB.name,
      traits: agent.parentB.traits as any,
      fitness: agent.parentB.fitness,
      generation: agent.parentB.generation,
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
  
  // Step 5: Reload Gateway
  const step5 = createStep("Reload OpenClaw gateway");
  steps.push(step5);
  updateStep(step5, "running");
  
  const gatewayStatus = await getGatewayStatus();
  
  if (gatewayStatus.running) {
    const reloadResult = await reloadGateway();
    
    if (reloadResult.success) {
      updateStep(step5, "success", reloadResult.message);
    } else {
      updateStep(step5, "failed", reloadResult.error);
    }
  } else {
    updateStep(step5, "success", "Gateway not running - skip reload");
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
  
  return NextResponse.json({
    ...result,
    activationMethod: "local",
  });
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
    // Get userId from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
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
    
    // Step 2: Check relay connection
    const step2 = createStep("Check connection");
    steps.push(step2);
    updateStep(step2, "running");
    
    const hasRelayConnection = userId ? isUserConnected(userId) : false;
    
    if (hasRelayConnection) {
      updateStep(step2, "success", "Via relay");
      
      // Send deprovision via relay
      const step3 = createStep("Send deprovision command");
      steps.push(step3);
      updateStep(step3, "running");
      
      await sendDeprovisionAgent(userId!, id, "User requested deactivation");
      updateStep(step3, "success");
    } else {
      updateStep(step2, "success", "Local deactivation");
      
      // Local deactivation
      const step3 = createStep("Remove from OpenClaw config");
      steps.push(step3);
      updateStep(step3, "running");
      
      const configResult = removeAgentFromConfig(id);
      updateStep(step3, configResult.success ? "success" : "failed", configResult.error);
      
      // Reload Gateway
      const step4 = createStep("Reload OpenClaw gateway");
      steps.push(step4);
      updateStep(step4, "running");
      
      const openclawAvailable = await isOpenClawAvailable();
      
      if (openclawAvailable) {
        const gatewayStatus = await getGatewayStatus();
        
        if (gatewayStatus.running) {
          const reloadResult = await reloadGateway();
          updateStep(step4, reloadResult.success ? "success" : "failed", 
            reloadResult.success ? reloadResult.message : reloadResult.error);
        } else {
          updateStep(step4, "success", "Gateway not running");
        }
      } else {
        updateStep(step4, "success", "OpenClaw not available");
      }
      
      // Deprovision workspace
      const step5 = createStep("Remove workspace");
      steps.push(step5);
      updateStep(step5, "running");
      
      const deprovisionResult = deprovisionWorkspace(id);
      updateStep(step5, deprovisionResult.success ? "success" : "failed", deprovisionResult.error);
    }
    
    // Final step: Update DB
    const stepDb = createStep("Update database");
    steps.push(stepDb);
    updateStep(stepDb, "running");
    
    await db
      .update(agents)
      .set({ 
        isActive: false,
        activatedAt: null,
      })
      .where(eq(agents.id, id));
    
    updateStep(stepDb, "success");
    
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
