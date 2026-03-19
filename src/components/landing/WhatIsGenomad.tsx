// src/components/landing/WhatIsGenomad.tsx
"use client";

import { motion } from "framer-motion";
import { SectionTitle, FeatureCard } from "@/components/ui";
import { Dna, Link2, Bot, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const pillarIcons = [Dna, Link2, Bot, ShieldCheck];
const pillarKeys = ["evolution", "permanence", "identity", "privacy"] as const;

export function WhatIsGenomad() {
  const { t, i18n } = useTranslation();

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
            key={`whatis-content-${i18n.language}`}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionTitle 
              title={t("whatIs.title")} 
              align="left"
              gradient
            />
            
            <p 
              className="text-lg leading-relaxed mb-6"
              style={{ color: '#ffffff' }}
            >
              {t("whatIs.description")}
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
          {pillarKeys.map((key, index) => {
            const Icon = pillarIcons[index];
            return (
              <motion.div
                key={`pillar-${key}-${i18n.language}`}
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
                  {t(`whatIs.pillars.${key}.title`)}
                </h3>
                <p className="text-sm" style={{ color: '#ffffff' }}>
                  {t(`whatIs.pillars.${key}.description`)}
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
