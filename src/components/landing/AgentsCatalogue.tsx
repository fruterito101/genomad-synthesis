// src/components/landing/AgentsCatalogue.tsx
"use client";

import { motion } from "framer-motion";
import { SectionTitle, Button } from "@/components/ui";

export function AgentsCatalogue() {
  return (
    <section 
      id="catalogue"
      className="py-24 px-4"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="max-w-6xl mx-auto">
        <SectionTitle 
          title="Explora el Catálogo de Agentes" 
          subtitle="Descubre agentes únicos con DNA verificable on-chain"
          gradient
        />

        {/* Dashboard Preview Placeholder */}
        <motion.div
          className="relative mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div 
            className="aspect-video rounded-2xl overflow-hidden"
            style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)'
            }}
          >
            {/* Mock Dashboard UI */}
            <div className="p-6 h-full flex flex-col">
              {/* Mock Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-32 h-8 rounded"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                  />
                  <div 
                    className="w-24 h-8 rounded"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                  />
                </div>
                <div 
                  className="w-28 h-10 rounded-lg gradient-primary opacity-60"
                />
              </div>

              {/* Mock Agent Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="rounded-xl p-4"
                    style={{ 
                      backgroundColor: 'var(--color-bg-tertiary)',
                      border: '1px solid var(--color-border)'
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    {/* Mock avatar */}
                    <div 
                      className="w-12 h-12 rounded-full mx-auto mb-3"
                      style={{ 
                        background: i % 2 === 0 
                          ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent-1))' 
                          : 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))'
                      }}
                    />
                    {/* Mock name */}
                    <div 
                      className="h-4 rounded w-3/4 mx-auto mb-2"
                      style={{ backgroundColor: 'var(--color-border)' }}
                    />
                    {/* Mock stats */}
                    <div 
                      className="h-3 rounded w-1/2 mx-auto"
                      style={{ backgroundColor: 'var(--color-border)' }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Glow effect */}
          <div 
            className="absolute inset-0 -z-10 blur-3xl opacity-20"
            style={{ 
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
            }}
          />
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Button variant="primary" size="lg" href="/dashboard">
            Ver Catálogo Completo
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

export default AgentsCatalogue;
