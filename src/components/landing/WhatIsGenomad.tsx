// src/components/landing/WhatIsGenomad.tsx
"use client";

import { motion } from "framer-motion";
import { SectionTitle, FeatureCard } from "@/components/ui";

const pillars = [
  {
    icon: "🧬",
    title: "Evolución",
    description: "Algoritmos genéticos que simulan selección natural"
  },
  {
    icon: "⛓️",
    title: "Permanencia",
    description: "Blockchain para propiedad inmutable"
  },
  {
    icon: "🤖",
    title: "Identidad",
    description: "Agentes AI con personalidad única"
  },
  {
    icon: "🔐",
    title: "Privacidad",
    description: "ZK proofs que verifican sin revelar"
  }
];

export function WhatIsGenomad() {
  return (
    <section 
      id="about"
      className="py-24 px-4"
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionTitle 
              title="¿Qué es Genomad?" 
              align="left"
              gradient
            />
            
            <p 
              className="text-lg leading-relaxed mb-6"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Genomad nace de una observación simple pero poderosa: las especies 
              se adaptan y evolucionan, pero los agentes AI no tienen ese 
              mecanismo... <span className="gradient-text font-semibold">hasta ahora.</span>
            </p>
            
            <p 
              className="text-lg leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Genomad lo hace posible: agentes que heredan, mutan y evolucionan, 
              donde los más aptos prosperan generación tras generación.
            </p>
          </motion.div>

          {/* Image Placeholder */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div 
              className="aspect-square rounded-2xl flex items-center justify-center"
              style={{ 
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)'
              }}
            >
              <motion.div 
                className="text-9xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                🧬
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Pillars Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {pillars.map((pillar, index) => (
            <FeatureCard
              key={pillar.title}
              icon={pillar.icon}
              title={pillar.title}
              description={pillar.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhatIsGenomad;
