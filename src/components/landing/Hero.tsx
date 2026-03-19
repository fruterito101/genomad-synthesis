// src/components/landing/Hero.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { Check } from "lucide-react";

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
      className="min-h-screen flex items-center justify-center pt-20 sm:pt-24 pb-16 px-4"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            {/* Tagline */}
            <motion.h1 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-none mb-4 sm:mb-6"
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
              className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8"
              style={{ color: '#ffffff' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              El primer protocolo de breeding de agentes AI — on-chain.
            </motion.p>

            {/* Features List */}
            <motion.ul 
              className="space-y-1 sm:space-y-2 mb-6 sm:mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <span 
                    className="mt-0.5 shrink-0"
                    style={{ color: 'var(--color-secondary)' }}
                  >
<Check className="w-4 h-4" style={{ color: "var(--color-secondary)" }} />
                  </span>
                  <span style={{ color: '#ffffff' }}>
                    {feature}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Button variant="primary" size="md" href="/dashboard" className="w-full sm:w-auto !bg-[var(--color-primary)]">
                Activación
              </Button>
              <Button variant="secondary" size="md" href="#about" className="w-full sm:w-auto">
                Aprende Más
              </Button>
            </motion.div>
          </motion.div>

          {/* Video Section */}
          <motion.div
            className="relative order-1 lg:order-2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div 
              className="aspect-video rounded-xl sm:rounded-2xl overflow-hidden"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)'
              }}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source 
                  src="https://res.cloudinary.com/ddejtxqjq/video/upload/v1771212418/GMD_zqv1gd.mp4" 
                  type="video/mp4" 
                />
                Tu navegador no soporta el tag de video.
              </video>
            </div>

            {/* Floating stats - hidden on very small screens */}
            <motion.div
              className="hidden sm:block absolute -bottom-3 sm:-bottom-4 -left-3 sm:-left-4 p-4 sm:p-5 rounded-xl glass glow-primary text-center min-w-[100px]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1 }}
            >
              <p className="text-2xl sm:text-3xl font-bold gradient-text">8</p>
              <p className="text-sm whitespace-nowrap" style={{ color: '#ffffff' }}>Traits únicos</p>
            </motion.div>

            <motion.div
              className="hidden sm:block absolute -top-3 sm:-top-4 -right-3 sm:-right-4 p-4 sm:p-5 rounded-xl glass glow-secondary text-center min-w-[130px]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.2 }}
            >
              <p className="text-2xl sm:text-3xl font-bold rotate-90" style={{ color: 'var(--color-secondary)' }}>∞</p>
              <p className="text-sm whitespace-nowrap" style={{ color: '#ffffff' }}>Combinaciones</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
