// src/components/LanguageSwitcher.tsx
"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "button" | "dropdown" | "text";
  showLabel?: boolean;
  className?: string;
}

export function LanguageSwitcher({ 
  variant = "button", 
  showLabel = false,
  className = "" 
}: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(newLang);
  };

  const currentLang = i18n.language === "es" ? "ES" : "EN";
  const nextLang = i18n.language === "es" ? "EN" : "ES";

  if (variant === "text") {
    return (
      <button
        onClick={toggleLanguage}
        className={`flex items-center gap-2 text-sm transition-opacity hover:opacity-80 ${className}`}
        style={{ color: "var(--color-text-secondary)" }}
        aria-label={t("languageSwitcher.label")}
      >
        <Globe className="w-4 h-4" />
        {i18n.language === "es" ? "Switch to English" : "Cambiar a Español"}
      </button>
    );
  }

  if (variant === "dropdown") {
    return (
      <div className={`relative ${className}`}>
        <motion.button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ 
            backgroundColor: "var(--color-bg-secondary)",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-border)"
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label={t("languageSwitcher.label")}
        >
          <Globe className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
          <span>{currentLang}</span>
          <span className="text-xs opacity-50">→ {nextLang}</span>
        </motion.button>
      </div>
    );
  }

  // Default: button variant
  return (
    <motion.button
      onClick={toggleLanguage}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80 ${className}`}
      style={{ 
        backgroundColor: "var(--color-bg-tertiary)",
        color: "var(--color-text-secondary)",
        border: "1px solid var(--color-border)"
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label={t("languageSwitcher.label")}
    >
      {showLabel && <Globe className="w-4 h-4 inline mr-1.5" />}
      {nextLang}
    </motion.button>
  );
}

export default LanguageSwitcher;
