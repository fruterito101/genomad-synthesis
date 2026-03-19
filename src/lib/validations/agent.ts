import { z } from "zod";

// Schema para un trait individual
const traitSchema = z.number()
  .min(0, "Trait debe ser >= 0")
  .max(100, "Trait debe ser <= 100");

// Schema para todos los traits
export const traitsSchema = z.object({
  technical: traitSchema,
  creativity: traitSchema,
  social: traitSchema,
  analysis: traitSchema,
  empathy: traitSchema,
  trading: traitSchema,
  teaching: traitSchema,
  leadership: traitSchema,
}).strict();

// Schema completo para registro
export const registerAgentSchema = z.object({
  name: z.string()
    .min(2, "Nombre muy corto")
    .max(50, "Nombre muy largo")
    .regex(/^[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s\-_]+$/, "Caracteres inválidos en nombre"),
  
  traits: traitsSchema,
  
  dnaHash: z.string()
    .min(32, "DNA hash muy corto")
    .max(128, "DNA hash muy largo"),
  
  skillCount: z.number().int().min(0).max(100).optional().default(0),
  
  generation: z.number().int().min(0).max(1000).optional().default(0),
  
  botUsername: z.string().max(50).optional().nullable(),
  
  code: z.string().length(6).optional().nullable(),
  
  source: z.string().max(100).optional().default("unknown"),
});

export type RegisterAgentInput = z.infer<typeof registerAgentSchema>;

// Función helper para validar
export function validateAgentRegistration(data: unknown): { valid: true; data: RegisterAgentInput } | { valid: false; errors: string[] } {
  const result = registerAgentSchema.safeParse(data);
  
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`),
    };
  }
  
  return { valid: true, data: result.data };
}

// Constantes de seguridad
export const FITNESS_MAX = 92;
export const FITNESS_MIN = 5;
export const TRAIT_EXTREME_THRESHOLD = 95;
export const TRAIT_AVERAGE_MAX = 90;
export const MAX_EXTREME_TRAITS = 3;
