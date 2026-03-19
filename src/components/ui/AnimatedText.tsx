// src/components/ui/AnimatedText.tsx
"use client";

import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  animation?: "typewriter" | "reveal" | "gradient" | "fadeUp";
  delay?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export function AnimatedText({
  text,
  animation = "fadeUp",
  delay = 0,
  className = "",
  as: Component = "p"
}: AnimatedTextProps) {
  // Fade up animation (default)
  if (animation === "fadeUp") {
    return (
      <motion.p
        className={className}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
      >
        {text}
      </motion.p>
    );
  }

  // Reveal animation (mask)
  if (animation === "reveal") {
    return (
      <div className="overflow-hidden">
        <motion.p
          className={className}
          initial={{ y: "100%" }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay, ease: "easeOut" }}
        >
          {text}
        </motion.p>
      </div>
    );
  }

  // Typewriter animation
  if (animation === "typewriter") {
    const letters = text.split("");
    
    return (
      <motion.p
        className={className}
        initial={{ opacity: 1 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.03, delay: delay + index * 0.03 }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.p>
    );
  }

  // Gradient animation (color shift)
  if (animation === "gradient") {
    return (
      <motion.p
        className={`gradient-text ${className}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        style={{
          backgroundSize: '200% 200%',
          animation: 'gradientShift 3s ease infinite'
        }}
      >
        {text}
      </motion.p>
    );
  }

  return <p className={className}>{text}</p>;
}

export default AnimatedText;
