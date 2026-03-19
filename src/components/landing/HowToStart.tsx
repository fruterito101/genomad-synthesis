// src/components/landing/HowToStart.tsx
"use client";

import { motion } from "framer-motion";
import { SectionTitle, StepCircle } from "@/components/ui";
import { useTranslation } from "react-i18next";

export function HowToStart() {
  const { t, i18n } = useTranslation();

  const steps = [
    {
      number: 1,
      title: t("howToStart.steps.0.title"),
      description: t("howToStart.steps.0.description")
    },
    {
      number: 2,
      title: t("howToStart.steps.1.title"),
      description: t("howToStart.steps.1.description")
    },
    {
      number: 3,
      title: t("howToStart.steps.2.title"),
      description: t("howToStart.steps.2.description")
    }
  ];

  return (
    <section 
      id="guides"
      className="py-24 px-4"
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
    >
      <div className="max-w-6xl mx-auto">
        <SectionTitle 
          title={t("howToStart.title")} 
          subtitle={t("howToStart.subtitle")}
          gradient
        />

        {/* Steps */}
        <div className="relative mt-16">
          {/* Connection Line (desktop) */}
          <div className="hidden md:block absolute top-10 left-1/2 -translate-x-1/2 w-2/3 h-0.5">
            <motion.div
              key={`line-${i18n.language}`}
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
                key={`step-${step.number}-${i18n.language}`}
                number={step.number}
                title={step.title}
                description={step.description}
                isActive={index === 0}
                delay={index * 0.2}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowToStart;
