// src/components/ui/FeatureCard.tsx
"use client";

import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: string | React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
  className = ""
}: FeatureCardProps) {
  return (
    <motion.div
      className={`p-6 rounded-xl ${className}`}
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)'
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 40px rgba(123, 63, 228, 0.2)',
        borderColor: 'var(--color-primary)'
      }}
    >
      {/* Icon */}
      <div 
        className="text-4xl mb-4"
        style={{ 
          filter: 'drop-shadow(0 0 10px rgba(123, 63, 228, 0.3))'
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <h3 
        className="text-xl font-bold mb-2"
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

export default FeatureCard;
