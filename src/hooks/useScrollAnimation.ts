// src/hooks/useScrollAnimation.ts
// Custom hook for scroll-triggered animations

"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.3,
    triggerOnce = true,
    rootMargin = "-100px 0px"
  } = options;

  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: triggerOnce,
    margin: rootMargin as `${number}px ${number}px` | `${number}px ${number}px ${number}px ${number}px`,
    amount: threshold
  });

  return { ref, isInView };
}

// Simplified version that just returns the motion props
export function useAnimateOnScroll(options: UseScrollAnimationOptions = {}) {
  const { ref, isInView } = useScrollAnimation(options);
  
  return {
    ref,
    initial: "hidden" as const,
    animate: isInView ? "visible" as const : "hidden" as const
  };
}

export default useScrollAnimation;
