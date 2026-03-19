// src/components/landing/Footer.tsx
"use client";

import Link from "next/link";
import { Dna, Twitter, Github, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { i18n } = useTranslation();

  const links = {
    platform: [
      { label: i18n.language === "es" ? "Dashboard" : "Dashboard", href: "/dashboard" },
      { label: i18n.language === "es" ? "Catálogo" : "Catalog", href: "/agents" },
      { label: i18n.language === "es" ? "Breeding" : "Breeding", href: "/breeding" },
    ],
    resources: [
      { label: "Docs", href: "#" },
      { label: "GitHub", href: "https://github.com/fruterito101/genomad" },
      { label: "Monad", href: "https://monad.xyz" },
    ],
    socials: [
      { icon: Twitter, href: "https://twitter.com/genomad", label: "Twitter" },
      { icon: Github, href: "https://github.com/fruterito101/genomad", label: "GitHub" },
      { icon: MessageCircle, href: "#", label: "Discord" },
    ],
  };

  return (
    <footer className="py-12 px-4 bg-muted/50 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Dna className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Genomad</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {i18n.language === "es" 
                ? "El primer protocolo de breeding de agentes AI on-chain."
                : "The first on-chain AI agent breeding protocol."}
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4">{i18n.language === "es" ? "Plataforma" : "Platform"}</h4>
            <ul className="space-y-2">
              {links.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">{i18n.language === "es" ? "Recursos" : "Resources"}</h4>
            <ul className="space-y-2">
              {links.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} target="_blank" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-semibold mb-4">{i18n.language === "es" ? "Comunidad" : "Community"}</h4>
            <div className="flex gap-3">
              {links.socials.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Genomad. {i18n.language === "es" ? "Todos los derechos reservados." : "All rights reserved."}
          </p>
          <p className="text-sm text-muted-foreground">
            {i18n.language === "es" ? "Construido en" : "Built on"}{" "}
            <span className="text-primary font-medium">Monad</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
