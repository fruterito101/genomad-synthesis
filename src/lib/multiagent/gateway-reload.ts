// ═══════════════════════════════════════════════════════════════════
// GATEWAY RELOAD INTEGRATION
// Integrates with OpenClaw gateway to reload after config changes
// ═══════════════════════════════════════════════════════════════════

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// ═══════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════

const OPENCLAW_BIN = process.env.OPENCLAW_BIN || "openclaw";
const GATEWAY_TIMEOUT = 30000; // 30 seconds

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface GatewayStatus {
  running: boolean;
  pid?: number;
  uptime?: number;
  agents?: string[];
  error?: string;
}

export interface ReloadResult {
  success: boolean;
  message?: string;
  error?: string;
  duration?: number;
}

// ═══════════════════════════════════════════════════════════════════
// FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Get gateway status
 */
export async function getGatewayStatus(): Promise<GatewayStatus> {
  try {
    const { stdout } = await execAsync(`${OPENCLAW_BIN} gateway status --json`, {
      timeout: GATEWAY_TIMEOUT,
    });
    
    const status = JSON.parse(stdout);
    return {
      running: status.running ?? false,
      pid: status.pid,
      uptime: status.uptime,
      agents: status.agents,
    };
  } catch (error) {
    // Try without --json flag
    try {
      const { stdout } = await execAsync(`${OPENCLAW_BIN} gateway status`, {
        timeout: GATEWAY_TIMEOUT,
      });
      
      const running = stdout.toLowerCase().includes("running");
      return { running };
    } catch {
      return {
        running: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

/**
 * Reload gateway to pick up config changes
 */
export async function reloadGateway(): Promise<ReloadResult> {
  const startTime = Date.now();
  
  try {
    // First check if gateway is running
    const status = await getGatewayStatus();
    
    if (!status.running) {
      return {
        success: false,
        error: "Gateway is not running",
      };
    }
    
    // Send reload signal (SIGUSR1)
    await execAsync(`${OPENCLAW_BIN} gateway reload`, {
      timeout: GATEWAY_TIMEOUT,
    });
    
    // Wait a moment for reload to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify gateway is still running
    const newStatus = await getGatewayStatus();
    
    if (!newStatus.running) {
      return {
        success: false,
        error: "Gateway stopped after reload",
        duration: Date.now() - startTime,
      };
    }
    
    return {
      success: true,
      message: "Gateway reloaded successfully",
      duration: Date.now() - startTime,
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Restart gateway (stop + start)
 */
export async function restartGateway(): Promise<ReloadResult> {
  const startTime = Date.now();
  
  try {
    // Stop gateway
    try {
      await execAsync(`${OPENCLAW_BIN} gateway stop`, {
        timeout: GATEWAY_TIMEOUT,
      });
    } catch {
      // Ignore stop errors - might not be running
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Start gateway
    await execAsync(`${OPENCLAW_BIN} gateway start`, {
      timeout: GATEWAY_TIMEOUT,
    });
    
    // Wait for startup
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verify running
    const status = await getGatewayStatus();
    
    if (!status.running) {
      return {
        success: false,
        error: "Gateway failed to start",
        duration: Date.now() - startTime,
      };
    }
    
    return {
      success: true,
      message: "Gateway restarted successfully",
      duration: Date.now() - startTime,
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Notify gateway of new agent (lightweight, no full reload)
 */
export async function notifyNewAgent(agentId: string): Promise<ReloadResult> {
  try {
    // Use the gateway tool if available
    await execAsync(`${OPENCLAW_BIN} gateway notify --agent ${agentId}`, {
      timeout: GATEWAY_TIMEOUT,
    });
    
    return {
      success: true,
      message: `Notified gateway of new agent: ${agentId}`,
    };
  } catch {
    // Fallback to full reload
    return reloadGateway();
  }
}

/**
 * Check if OpenClaw CLI is available
 */
export async function isOpenClawAvailable(): Promise<boolean> {
  try {
    await execAsync(`which ${OPENCLAW_BIN}`, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get OpenClaw version
 */
export async function getOpenClawVersion(): Promise<string | null> {
  try {
    const { stdout } = await execAsync(`${OPENCLAW_BIN} --version`, {
      timeout: 5000,
    });
    return stdout.trim();
  } catch {
    return null;
  }
}
