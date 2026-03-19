"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "vp70qbf4k1";

export function ClarityAnalytics() {
  useEffect(() => {
    if (typeof window !== "undefined" && CLARITY_PROJECT_ID) {
      Clarity.init(CLARITY_PROJECT_ID);
    }
  }, []);

  return null;
}

export default ClarityAnalytics;
