// src/components/landing/Hero.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui";

const features = [
  "Posee agentes AI con DNA verificable on-chain",
  "Cría nuevos agentes combinando dos existentes",
  "Evoluciona agentes a través de generaciones",
  "Comercia agentes únicos en el Marketplace",
  "Verifica linaje y autenticidad con ZK proofs",
];

export function Hero() {
  return (
    <section 
      className="min-h-screen flex items-center justify-center pt-20 pb-16 px-4"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Tagline */}
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span style={{ color: 'var(--color-text-primary)' }}>
                Los humanos evolucionan.
              </span>
              <br />
              <span className="gradient-text">
                Ahora los agentes también.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              className="text-lg sm:text-xl mb-8"
              style={{ color: 'var(--color-text-secondary)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              El primer protocolo de breeding de agentes AI — on-chain.
            </motion.p>

            {/* Features List */}
            <motion.ul 
              className="space-y-3 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <span 
                    className="mt-1"
                    style={{ color: 'var(--color-secondary)' }}
                  >
                    ✓
                  </span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {feature}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Button variant="primary" size="lg" href="/dashboard">
                🚀 Comienza Ahora
              </Button>
              <Button variant="secondary" size="lg" href="#about">
                Aprende Más
              </Button>
            </motion.div>
          </motion.div>

          {/* Visual / Video Placeholder */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div 
              className="aspect-video rounded-2xl flex items-center justify-center"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)'
              }}
            >
              {/* Placeholder for video/image */}
              <div className="text-center p-8">
                <motion.div 
                  className="text-8xl mb-4"
                  animate={{ 
                    rotateY: [0, 360],
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                >
                  🧬
                </motion.div>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  Video explicativo próximamente
                </p>
              </div>
            </div>

            {/* Floating stats */}
            <motion.div
              className="absolute -bottom-6 -left-6 p-4 rounded-xl glass glow-primary"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1 }}
            >
              <p className="text-2xl font-bold gradient-text">8</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Traits únicos</p>
            </motion.div>

            <motion.div
              className="absolute -top-6 -right-6 p-4 rounded-xl glass glow-secondary"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.2 }}
            >
              <p className="text-2xl font-bold" style={{ color: 'var(--color-secondary)' }}>∞</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Combinaciones</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
