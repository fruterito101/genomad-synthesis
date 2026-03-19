// src/lib/rate-limit.ts
// Ticket 3.6: Rate Limit con Redis + fallback in-memory
// Persiste entre restarts, compatible con múltiples instancias

import { Redis } from "@upstash/redis";

// ============================================
// CONFIGURACIÓN
// ============================================

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  register: { windowMs: 60 * 1000, maxRequests: 5 },       // 5 registros/min
  breeding: { windowMs: 60 * 1000, maxRequests: 10 },      // 10 breeding/min
  activate: { windowMs: 60 * 1000, maxRequests: 3 },       // 3 activaciones/min
  alert: { windowMs: 60 * 1000, maxRequests: 10 },         // 10 alertas/min
  default: { windowMs: 60 * 1000, maxRequests: 60 },       // 60 req/min general
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  backend: "redis" | "memory";
}

// ============================================
// REDIS CLIENT (lazy initialization)
// ============================================

let redisClient: Redis | null = null;
let redisAvailable = true;
let lastRedisCheck = 0;
const REDIS_RETRY_MS = 60000; // Reintentar Redis cada 1 min

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis({ url, token });
  }

  return redisClient;
}

async function isRedisHealthy(): Promise<boolean> {
  const now = Date.now();

  // Si falló recientemente, no reintentar aún
  if (!redisAvailable && now - lastRedisCheck < REDIS_RETRY_MS) {
    return false;
  }

  const client = getRedisClient();
  if (!client) {
    return false;
  }

  try {
    await client.ping();
    redisAvailable = true;
    return true;
  } catch {
    redisAvailable = false;
    lastRedisCheck = now;
    console.warn("[rate-limit] Redis unavailable, using in-memory fallback");
    return false;
  }
}

// ============================================
// IN-MEMORY FALLBACK
// ============================================

interface MemoryRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryRecord>();

function checkMemoryRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();

  // Cleanup periódico (1% probabilidad)
  if (Math.random() < 0.01) {
    for (const [k, record] of memoryStore.entries()) {
      if (record.resetAt < now) {
        memoryStore.delete(k);
      }
    }
  }

  const record = memoryStore.get(key);

  // Sin record o expirado
  if (!record || record.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
      backend: "memory",
    };
  }

  // Límite excedido
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetAt - now,
      backend: "memory",
    };
  }

  // Incrementar
  record.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetIn: record.resetAt - now,
    backend: "memory",
  };
}

// ============================================
// REDIS RATE LIMIT (sliding window)
// ============================================

async function checkRedisRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const client = getRedisClient()!;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Usar sorted set para sliding window
  const redisKey = `ratelimit:${key}`;

  try {
    // Pipeline para atomicidad
    const pipeline = client.pipeline();

    // 1. Remover entradas viejas (fuera de ventana)
    pipeline.zremrangebyscore(redisKey, 0, windowStart);

    // 2. Contar entradas actuales
    pipeline.zcard(redisKey);

    // 3. Agregar nueva entrada
    pipeline.zadd(redisKey, { score: now, member: `${now}-${Math.random()}` });

    // 4. Establecer TTL
    pipeline.expire(redisKey, Math.ceil(config.windowMs / 1000) + 1);

    const results = await pipeline.exec();
    const currentCount = (results[1] as number) || 0;

    if (currentCount >= config.maxRequests) {
      // Obtener tiempo del request más viejo para calcular resetIn
      const oldest = await client.zrange(redisKey, 0, 0, { withScores: true });
      const oldestTime = oldest.length > 0 ? (oldest[0] as { score: number }).score : now;
      const resetIn = Math.max(0, config.windowMs - (now - oldestTime));

      return {
        allowed: false,
        remaining: 0,
        resetIn,
        backend: "redis",
      };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - currentCount - 1,
      resetIn: config.windowMs,
      backend: "redis",
    };
  } catch (error) {
    console.error("[rate-limit] Redis error:", error);
    // Fallback a memoria
    redisAvailable = false;
    lastRedisCheck = now;
    return checkMemoryRateLimit(key, config);
  }
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Check rate limit for an identifier
 * Usa Redis si disponible, fallback a in-memory
 */
export async function checkRateLimit(
  identifier: string,
  type: string = "default"
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[type] || RATE_LIMITS.default;
  const key = `${type}:${identifier}`;

  // Intentar Redis primero
  if (await isRedisHealthy()) {
    return checkRedisRateLimit(key, config);
  }

  // Fallback a memoria
  return checkMemoryRateLimit(key, config);
}

/**
 * Sync version para compatibilidad con código existente
 * NOTA: Siempre usa memoria, para async usar checkRateLimit()
 */
export function checkRateLimitSync(
  identifier: string,
  type: string = "default"
): Omit<RateLimitResult, "backend"> & { backend: "memory" } {
  const config = RATE_LIMITS[type] || RATE_LIMITS.default;
  const key = `${type}:${identifier}`;
  return checkMemoryRateLimit(key, config);
}

/**
 * Reset rate limit for an identifier (admin use)
 */
export async function resetRateLimit(
  identifier: string,
  type: string = "default"
): Promise<void> {
  const key = `${type}:${identifier}`;

  // Reset memoria
  memoryStore.delete(key);

  // Reset Redis si disponible
  const client = getRedisClient();
  if (client && redisAvailable) {
    try {
      await client.del(`ratelimit:${key}`);
    } catch {
      // Ignorar errores de Redis
    }
  }
}

/**
 * Get rate limit stats (admin use)
 */
export function getRateLimitStats(): {
  memoryKeys: number;
  redisAvailable: boolean;
  configs: typeof RATE_LIMITS;
} {
  return {
    memoryKeys: memoryStore.size,
    redisAvailable,
    configs: RATE_LIMITS,
  };
}

/**
 * Helper para obtener IP del cliente
 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/**
 * Middleware helper para Next.js API routes
 */
export async function withRateLimit(
  request: Request,
  type: string = "default"
): Promise<{ allowed: boolean; headers: Record<string, string>; result: RateLimitResult }> {
  const ip = getClientIP(request);
  const result = await checkRateLimit(ip, type);

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(RATE_LIMITS[type]?.maxRequests || RATE_LIMITS.default.maxRequests),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetIn / 1000)),
    "X-RateLimit-Backend": result.backend,
  };

  if (!result.allowed) {
    headers["Retry-After"] = String(Math.ceil(result.resetIn / 1000));
  }

  return { allowed: result.allowed, headers, result };
}
