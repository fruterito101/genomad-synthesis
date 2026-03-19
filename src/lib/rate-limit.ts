/**
 * Simple in-memory rate limiter
 * Para producción, usar Redis o similar
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Configuración por tipo de operación
const RATE_LIMITS: Record<string, { windowMs: number; maxRequests: number }> = {
  register: { windowMs: 60 * 1000, maxRequests: 5 },      // 5 registros/min
  default: { windowMs: 60 * 1000, maxRequests: 30 },      // 30 req/min
  alert: { windowMs: 60 * 1000, maxRequests: 10 },        // 10 alertas/min
};

export function checkRateLimit(
  identifier: string, 
  type: string = "default"
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const config = RATE_LIMITS[type] || RATE_LIMITS.default;
  const key = `${type}:${identifier}`;
  
  // Limpiar records viejos periodicamente
  if (Math.random() < 0.01) {
    cleanupOldRecords(now);
  }
  
  const record = rateLimitStore.get(key);
  
  // Si no hay record o expiró, crear nuevo
  if (!record || record.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { 
      allowed: true, 
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }
  
  // Si excede el límite
  if (record.count >= config.maxRequests) {
    return { 
      allowed: false, 
      remaining: 0,
      resetIn: record.resetAt - now,
    };
  }
  
  // Incrementar contador
  record.count++;
  return { 
    allowed: true, 
    remaining: config.maxRequests - record.count,
    resetIn: record.resetAt - now,
  };
}

function cleanupOldRecords(now: number): void {
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Helper para obtener IP
export function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
