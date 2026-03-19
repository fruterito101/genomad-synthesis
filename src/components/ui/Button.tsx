// src/components/ui/Button.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
}

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg"
};

const variantClasses = {
  primary: "gradient-primary text-white border-0",
  secondary: "bg-transparent border-2 text-white",
  ghost: "bg-transparent border-0 text-white hover:underline"
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  onClick,
  href,
  className = "",
  disabled = false,
  type = "button",
  ariaLabel
}: ButtonProps) {
  const baseClasses = "font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F2F]";
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  const style: React.CSSProperties = variant === "secondary" 
    ? { borderColor: 'var(--color-primary)' }
    : {};

  const hoverEffect = {
    scale: disabled ? 1 : 1.02,
    boxShadow: disabled ? "none" : variant === "primary" 
      ? "0 0 25px rgba(123, 63, 228, 0.5)"
      : variant === "secondary"
      ? "0 0 20px rgba(123, 63, 228, 0.3)"
      : "none"
  };

  const tapEffect = {
    scale: disabled ? 1 : 0.98
  };

  if (href && !disabled) {
    return (
      <Link href={href} aria-label={ariaLabel}>
        <motion.span
          className={classes}
          style={style}
          whileHover={hoverEffect}
          whileTap={tapEffect}
          role="button"
        >
          {children}
        </motion.span>
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      className={classes}
      style={style}
      onClick={onClick}
      disabled={disabled}
      whileHover={hoverEffect}
      whileTap={tapEffect}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {children}
    </motion.button>
  );
}

export default Button;
