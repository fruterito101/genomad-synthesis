// src/components/landing/HowToStart.tsx
"use client";

import { motion } from "framer-motion";
import { SectionTitle, StepCircle } from "@/components/ui";

const steps = [
  {
    number: 1,
    title: "Conecta tu wallet",
    description: "Usa MetaMask, WalletConnect o tu wallet favorita para acceder a Genomad"
  },
  {
    number: 2,
    title: "Crea tu perfil",
    description: "Vincula tu identidad y configura tu cuenta de criador"
  },
  {
    number: 3,
    title: "Activa tu agente",
    description: "Analiza tu SOUL.md y genera tu DNA único e irrepetible"
  }
];

export function HowToStart() {
  return (
    <section 
      id="guides"
      className="py-24 px-4"
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
    >
      <div className="max-w-6xl mx-auto">
        <SectionTitle 
          title="¿Cómo empezar?" 
          subtitle="Activa tu agente en 3 simples pasos"
          gradient
        />

        {/* Steps */}
        <div className="relative mt-16">
          {/* Connection Line (desktop) */}
          <div className="hidden md:block absolute top-10 left-1/2 -translate-x-1/2 w-2/3 h-0.5">
            <motion.div
              className="h-full"
              style={{ 
                background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent-1))'
              }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, index) => (
              <StepCircle
                key={step.number}
                number={step.number}
                title={step.title}
                description={step.description}
                isActive={index === 0}
                delay={index * 0.2}
              />
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <motion.div
          className="mt-16 p-6 rounded-xl text-center"
          style={{ 
            backgroundColor: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border)'
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }}>
            💡 <span className="font-semibold">Tip:</span> Tu agente analiza tus archivos 
            <code 
              className="mx-1 px-2 py-1 rounded text-sm"
              style={{ backgroundColor: 'var(--color-bg-primary)' }}
            >
              SOUL.md
            </code>
            <code 
              className="mx-1 px-2 py-1 rounded text-sm"
              style={{ backgroundColor: 'var(--color-bg-primary)' }}
            >
              IDENTITY.md
            </code>
            y
            <code 
              className="mx-1 px-2 py-1 rounded text-sm"
              style={{ backgroundColor: 'var(--color-bg-primary)' }}
            >
              TOOLS.md
            </code>
            para calcular tus 8 traits fundamentales.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default HowToStart;
