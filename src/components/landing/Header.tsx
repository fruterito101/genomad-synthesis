// src/components/landing/Header.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";
import { useTranslation } from "react-i18next";

export function Header() {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { label: t("header.nav.about"), href: "#about", ariaLabel: i18n.language === "es" ? "Ir a sección Acerca de nosotros" : "Go to About section" },
    { label: t("header.nav.catalogue"), href: "#catalogue", ariaLabel: i18n.language === "es" ? "Ir a sección Catálogo de agentes" : "Go to Catalogue section" },
    { label: t("header.nav.guides"), href: "#guides", ariaLabel: i18n.language === "es" ? "Ir a sección Guías" : "Go to Guides section" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(newLang);
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg"
            aria-label="Genomad - Home"
          >
            <Image 
              src="/logo.png" 
              alt="Genomad" 
              width={140} 
              height={40} 
              className="h-8 sm:h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label={i18n.language === "es" ? "Navegación principal" : "Main navigation"}>
            {navItems.map((item) => {
              const sectionId = item.href.replace("#", "");
              const isActive = activeSection === sectionId;
              
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="text-sm font-medium transition-all duration-200 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded px-2 py-1"
                  style={{ 
                    color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)"
                  }}
                  aria-label={item.ariaLabel}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5"
                      style={{ backgroundColor: "var(--color-primary)" }}
                      layoutId="activeNav"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80"
              style={{ 
                backgroundColor: "var(--color-bg-secondary)",
                color: "var(--color-text-secondary)",
                border: "1px solid var(--color-border)"
              }}
              aria-label={t("languageSwitcher.label")}
            >
              {i18n.language === "es" ? "EN" : "ES"}
            </button>

            <Button variant="primary" size="sm" href="/dashboard">
              {t("header.cta")}
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? (i18n.language === "es" ? "Cerrar menú" : "Close menu") : (i18n.language === "es" ? "Abrir menú" : "Open menu")}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <motion.span
                className="w-full h-0.5 rounded"
                style={{ backgroundColor: "var(--color-text-primary)" }}
                animate={isMenuOpen ? { rotate: 45, y: 9 } : { rotate: 0, y: 0 }}
              />
              <motion.span
                className="w-full h-0.5 rounded"
                style={{ backgroundColor: "var(--color-text-primary)" }}
                animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              />
              <motion.span
                className="w-full h-0.5 rounded"
                style={{ backgroundColor: "var(--color-text-primary)" }}
                animate={isMenuOpen ? { rotate: -45, y: -9 } : { rotate: 0, y: 0 }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="md:hidden glass"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            role="navigation"
            aria-label={i18n.language === "es" ? "Navegación móvil" : "Mobile navigation"}
          >
            <nav className="px-4 py-4 flex flex-col gap-4">
              {navItems.map((item) => {
                const sectionId = item.href.replace("#", "");
                const isActive = activeSection === sectionId;
                
                return (
                  <button
                    key={`mobile-${item.href}`}
                    onClick={() => handleNavClick(item.href)}
                    className="text-base font-medium py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded px-2"
                    style={{ 
                      color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)"
                    }}
                    aria-label={item.ariaLabel}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {isActive && "→ "}{item.label}
                  </button>
                );
              })}

              {/* Mobile Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="text-base font-medium py-2 text-left px-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                🌐 {i18n.language === "es" ? "English" : "Español"}
              </button>

              <Button variant="primary" size="md" href="/dashboard">
                {t("header.cta")}
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Header;
