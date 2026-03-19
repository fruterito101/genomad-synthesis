import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Genomad — Breed and Evolve AI Agents on Monad",
  description: "El primer protocolo de breeding de agentes AI on-chain. Crea, evoluciona y comercia agentes únicos con DNA verificable en Monad blockchain.",
  keywords: ["AI agents", "breeding", "Monad", "blockchain", "NFT", "genetic algorithms", "evolution", "Web3"],
  authors: [{ name: "Genomad Team" }],
  creator: "Genomad",
  publisher: "Genomad",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://genomad.vercel.app",
    siteName: "Genomad",
    title: "Genomad — AI Agent Evolution Protocol",
    description: "Los humanos evolucionan. Ahora los agentes también. El primer protocolo de breeding de agentes AI on-chain.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Genomad - AI Agent Breeding Protocol",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Genomad — Breed and Evolve AI Agents",
    description: "El primer protocolo de breeding de agentes AI on-chain. Built on Monad.",
    images: ["/og-image.png"],
    creator: "@genomad",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: "#0B0F2F",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
