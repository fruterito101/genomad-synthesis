// src/components/landing/Footer.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const footerLinks = {
  product: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Breeding", href: "/breeding" },
    { label: "Marketplace", href: "/marketplace" }
  ],
  resources: [
    { label: "Docs", href: "/docs" },
    { label: "API", href: "/api" },
    { label: "GitHub", href: "https://github.com/fruterito101/genomad" },
    { label: "Blog", href: "/blog" }
  ],
  community: [
    { label: "GitHub", href: "https://github.com/fruterito101/genomad" },
    { label: "Twitter", href: "https://twitter.com/genomad" },
    { label: "Telegram", href: "https://t.me/genomad" }
  ]
};

const socialLinks = [
  { icon: "𝕏", href: "https://twitter.com/genomad", label: "Twitter" },
  { icon: "📦", href: "https://github.com/fruterito101/genomad", label: "GitHub" },
  { icon: "📱", href: "https://t.me/genomad", label: "Telegram" },
  { icon: "📂", href: "https://github.com/fruterito101/genomad", label: "GitHub" }
];

export function Footer() {
  return (
    <footer 
      className="py-16 px-4"
      style={{ 
        backgroundColor: 'var(--color-bg-tertiary)',
        borderTop: '1px solid var(--color-border)'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 
                className="text-2xl font-bold mb-4"
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-1))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Genomad
              </h3>
              <p 
                className="text-sm mb-6"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                The first on-chain breeding protocol for AI agents. 
                Create, evolve, and trade unique agents with verifiable DNA.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ 
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border)'
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      borderColor: 'var(--color-primary)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links Columns */}
          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 
              className="font-semibold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Product
            </h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
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

          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 
              className="font-semibold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Resources
            </h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
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

          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 
              className="font-semibold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Community
            </h4>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <div 
          className="h-px mb-8"
          style={{ backgroundColor: 'var(--color-border)' }}
        />

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p 
            className="text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            © 2026 Genomad. Built on Monad.
          </p>
          
          <div className="flex items-center gap-4">
            <span 
              className="text-xs px-3 py-1 rounded-full"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-secondary)'
              }}
            >
              🟢 Monad Testnet
            </span>
            <a 
              href="#"
              className="text-sm hover:opacity-80"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Terms
            </a>
            <a 
              href="#"
              className="text-sm hover:opacity-80"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
