// src/components/landing/Breeding.tsx
"use client";

import { motion } from "framer-motion";
import { SectionTitle, Button } from "@/components/ui";
import { Dna, Zap, Dices, Lock, Sparkles } from "lucide-react";

const breedingFeatures = [
  {
    icon: Dna,
    title: "DNA Heredable",
    description: "Los hijos heredan traits de ambos padres con variaciones únicas"
  },
  {
    icon: Zap,
    title: "Evolución On-Chain",
    description: "Cada breeding queda registrado permanentemente en Monad"
  },
  {
    icon: Dices,
    title: "Mutaciones Raras",
    description: "Posibilidad de traits únicos que no tenían los padres"
  },
  {
    icon: Lock,
    title: "Privacidad Total",
    description: "Solo los padres pueden ver el DNA de sus hijos"
  }
];

export function Breeding() {
  return (
    <section 
      id="breeding"
      className="py-24 px-4"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="max-w-6xl mx-auto">
        <SectionTitle 
          title="Sistema de Breeding" 
          subtitle="Crea la próxima generación de agentes"
          gradient
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mt-16 items-center">
          
          {/* Left: Visual Representation */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Breeding Visualization */}
            <div 
              className="aspect-square rounded-2xl p-8 flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-tertiary))',
                border: '1px solid var(--color-border)'
              }}
            >
              <div className="text-center">
                {/* Parent Agents */}
                <div className="flex justify-center gap-8 mb-8">
                  <motion.div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-1))',
                      boxShadow: '0 0 30px var(--color-primary)'
                    }}
                    animate={{ 
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        '0 0 30px var(--color-primary)',
                        '0 0 50px var(--color-primary)',
                        '0 0 30px var(--color-primary)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Dna className="w-10 h-10 text-white" />
                  </motion.div>
                  <motion.div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent-2))',
                      boxShadow: '0 0 30px var(--color-secondary)'
                    }}
                    animate={{ 
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        '0 0 30px var(--color-secondary)',
                        '0 0 50px var(--color-secondary)',
                        '0 0 30px var(--color-secondary)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    <Dna className="w-10 h-10 text-white" />
                  </motion.div>
                </div>

                {/* Connection Lines */}
                <motion.div
                  className="w-0.5 h-12 mx-auto"
                  style={{ backgroundColor: 'var(--color-accent-1)' }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />

                {/* Child Agent */}
                <motion.div
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mt-4"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2))',
                    boxShadow: '0 0 40px var(--color-accent-1)'
                  }}
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-12 h-12 text-white" />
                </motion.div>

                <p 
                  className="mt-6 text-sm"
                  style={{ color: '#ffffff' }}
                >
                  Nuevo agente con DNA único
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Features */}
          <div className="space-y-6">
            {breedingFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="flex gap-4 p-4 rounded-xl"
                  style={{ 
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)'
                  }}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    borderColor: 'var(--color-secondary)'
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: 'var(--color-secondary)' }} />
                  </div>
                  <div>
                    <h3 
                      className="font-semibold text-lg mb-1"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {feature.title}
                    </h3>
                    <p style={{ color: '#ffffff' }}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* CTA */}
            <motion.div
              className="pt-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Button variant="secondary" size="md" href="/breeding">
                Explorar Breeding →
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Breeding;
