// src/components/landing/WhatIsGenomad.tsx
"use client";

import { motion } from "framer-motion";
import { SectionTitle, FeatureCard } from "@/components/ui";
import { Dna, Link2, Bot, ShieldCheck } from "lucide-react";

const pillars = [
  {
    icon: Dna,
    title: "Evolución",
    description: "Algoritmos genéticos que simulan selección natural"
  },
  {
    icon: Link2,
    title: "Permanencia",
    description: "Blockchain para propiedad inmutable"
  },
  {
    icon: Bot,
    title: "Identidad",
    description: "Agentes AI con personalidad única"
  },
  {
    icon: ShieldCheck,
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
              style={{ color: '#ffffff' }}
            >
              Genomad nace de una observación simple pero poderosa: las especies 
              se adaptan y evolucionan, pero los agentes AI no tienen ese 
              mecanismo... <span className="gradient-text font-semibold">hasta ahora.</span>
            </p>
            
            <p 
              className="text-lg leading-relaxed"
              style={{ color: '#ffffff' }}
            >
              Genomad lo hace posible: agentes que heredan, mutan y evolucionan, 
              donde los más aptos prosperan generación tras generación.
            </p>
          </motion.div>

          {/* Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div 
              className="aspect-square rounded-2xl overflow-hidden"
              style={{ 
                border: '1px solid var(--color-border)'
              }}
            >
              <img
                src="https://res.cloudinary.com/ddejtxqjq/image/upload/v1771212819/MONAD_fby2ja.jpg"
                alt="Genomad - AI Agent Evolution on Monad"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* Pillars Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                className="p-6 rounded-xl text-center"
                style={{ 
                  backgroundColor: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border)'
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                >
                  <Icon className="w-8 h-8" style={{ color: 'var(--color-secondary)' }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  {pillar.title}
                </h3>
                <p className="text-sm" style={{ color: '#ffffff' }}>
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhatIsGenomad;
