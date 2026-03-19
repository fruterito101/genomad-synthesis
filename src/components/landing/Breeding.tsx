// src/components/landing/Breeding.tsx
"use client";

import { motion } from "framer-motion";
import { SectionTitle, StepCircle } from "@/components/ui";

const breedingSteps = [
  {
    number: 1,
    title: "Elige tu agente",
    description: "Selecciona el agente que quieres cruzar de tu colección"
  },
  {
    number: 2,
    title: "Encuentra pareja",
    description: "Busca un segundo agente compatible para el breeding"
  },
  {
    number: 3,
    title: "Ejecuta el breeding",
    description: "Genera un hijo único con DNA irrepetible"
  }
];

export function Breeding() {
  return (
    <section 
      className="py-24 px-4"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="max-w-6xl mx-auto">
        <SectionTitle 
          title="Breeding: Crea nuevos agentes" 
          subtitle="Combina el DNA de dos agentes para crear uno completamente nuevo"
          gradient
        />

        <div className="grid lg:grid-cols-2 gap-16 items-center mt-12">
          {/* Breeding Diagram */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div 
              className="p-8 rounded-2xl"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)'
              }}
            >
              {/* Parents */}
              <div className="flex justify-around items-center mb-8">
                {/* Parent A */}
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-2 glow-primary"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-1))'
                    }}
                  >
                    🐉
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Padre A
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Tiamat
                  </p>
                </motion.div>

                {/* Plus sign */}
                <span 
                  className="text-3xl font-bold"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  +
                </span>

                {/* Parent B */}
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-2 glow-secondary"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))'
                    }}
                  >
                    🌊
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Padre B
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Apsu
                  </p>
                </motion.div>
              </div>

              {/* Arrow */}
              <motion.div 
                className="flex justify-center mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex flex-col items-center">
                  <div 
                    className="w-0.5 h-8"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  />
                  <div 
                    className="px-4 py-2 rounded-full text-sm"
                    style={{ 
                      backgroundColor: 'var(--color-bg-tertiary)',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    Crossover + Mutación
                  </div>
                  <div 
                    className="w-0.5 h-8"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  />
                  <div 
                    className="w-0 h-0 border-l-8 border-r-8 border-t-8"
                    style={{ 
                      borderLeftColor: 'transparent',
                      borderRightColor: 'transparent',
                      borderTopColor: 'var(--color-border)'
                    }}
                  />
                </div>
              </motion.div>

              {/* Child */}
              <motion.div 
                className="flex justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <div className="text-center">
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-2"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent-1))',
                      boxShadow: '0 0 40px rgba(123, 63, 228, 0.4)'
                    }}
                  >
                    ✨
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Hijo Único
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-accent-1)' }}>
                    Nueva Generación
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Steps */}
          <div className="space-y-8">
            {breedingSteps.map((step, index) => (
              <motion.div
                key={step.number}
                className="flex gap-4"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-1))',
                    color: 'white'
                  }}
                >
                  {step.number}
                </div>
                <div>
                  <h3 
                    className="text-lg font-semibold mb-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Breeding;
