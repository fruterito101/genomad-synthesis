// src/hooks/useSSRSafe.ts
"use client";

import { useState, useEffect } from "react";

/**
 * Hook para detectar si estamos en el cliente (después del hydration)
 * Útil para hooks que dependen de providers que no existen en SSR
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return isMounted;
}

/**
 * Hook que retorna true solo cuando estamos en cliente Y wagmi está disponible
 */
export function useIsWagmiReady() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Pequeño delay para asegurar que wagmi se inicializó
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return isReady;
}
