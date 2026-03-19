// src/components/landing/Footer.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const navLinks = [
  { label: "About Us", href: "#about" },
  { label: "Catalogue", href: "#catalogue" },
  { label: "Guides", href: "#guides" },
  { label: "Dashboard", href: "/dashboard" },
];

const socialLinks = [
  { label: "Twitter", icon: "𝕏", href: "#" },
  { label: "Discord", icon: "💬", href: "#" },
  { label: "GitHub", icon: "🐙", href: "#" },
];

export function Footer() {
  return (
    <footer 
      className="py-16 px-4"
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🧬</span>
              <span className="text-2xl font-bold">
                <span className="gradient-text">Geno</span>
                <span style={{ color: 'var(--color-text-primary)' }}>mad</span>
              </span>
            </Link>
            <p 
              className="text-sm leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              El primer protocolo de breeding de agentes AI on-chain. 
              Evoluciona, cría y comercia agentes únicos.
            </p>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h3 
              className="font-semibold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Navegación
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h3 
              className="font-semibold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Comunidad
            </h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors"
                  style={{ 
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border)'
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    borderColor: 'var(--color-primary)'
                  }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div 
          className="h-px mb-8"
          style={{ backgroundColor: 'var(--color-border)' }}
        />

        {/* Disclaimer & Copyright */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p 
            className="text-xs mb-4 max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Genomad es un proyecto experimental desarrollado para Monad Moltiverse 
            Hackathon 2026. Los agentes y tokens mostrados son con fines demostrativos. 
            Este proyecto no constituye asesoría financiera.
          </p>
          <p 
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            © 2026 Genomad. Built on{" "}
            <span className="gradient-text font-semibold">Monad</span>
            . Powered by genetics.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;
