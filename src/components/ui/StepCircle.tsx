// src/components/ui/StepCircle.tsx
"use client";

import { motion } from "framer-motion";

interface StepCircleProps {
  number: number;
  title: string;
  description: string;
  isActive?: boolean;
  icon?: React.ReactNode;
  delay?: number;
}

export function StepCircle({
  number,
  title,
  description,
  isActive = false,
  icon,
  delay = 0
}: StepCircleProps) {
  return (
    <motion.div
      className="flex flex-col items-center text-center max-w-xs"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
    >
      {/* Circle with number */}
      <motion.div
        className="relative w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{
          background: isActive 
            ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent-1))'
            : 'transparent',
          border: isActive ? 'none' : '2px solid transparent',
          backgroundImage: isActive 
            ? undefined
            : 'linear-gradient(var(--color-bg-primary), var(--color-bg-primary)), linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          backgroundOrigin: 'border-box',
          backgroundClip: isActive ? undefined : 'padding-box, border-box'
        }}
        whileHover={{ 
          scale: 1.1,
          boxShadow: '0 0 30px rgba(123, 63, 228, 0.5)'
        }}
        transition={{ duration: 0.2 }}
      >
        {icon ? (
          <span className="text-2xl">{icon}</span>
        ) : (
          <span 
            className="text-2xl font-bold"
            style={{ color: isActive ? 'white' : 'var(--color-primary)' }}
          >
            {number}
          </span>
        )}
      </motion.div>

      {/* Title */}
      <h3 
        className="text-lg font-bold mb-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>

      {/* Description */}
      <p 
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {description}
      </p>
    </motion.div>
  );
}

export default StepCircle;
