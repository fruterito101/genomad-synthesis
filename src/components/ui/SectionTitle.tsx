// src/components/ui/SectionTitle.tsx
"use client";

import { motion } from "framer-motion";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  gradient?: boolean;
  className?: string;
}

export function SectionTitle({
  title,
  subtitle,
  align = "center",
  gradient = false,
  className = ""
}: SectionTitleProps) {
  const alignClass = align === "center" ? "text-center" : "text-left";

  return (
    <motion.div
      className={`mb-12 ${alignClass} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <h2 
        className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${gradient ? 'gradient-text' : ''}`}
        style={gradient ? undefined : { color: 'var(--color-text-primary)' }}
      >
        {title}
      </h2>
      
      {subtitle && (
        <p 
          className="text-lg sm:text-xl max-w-2xl mx-auto"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

export default SectionTitle;
