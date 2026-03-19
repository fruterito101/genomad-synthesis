"use client";

import dynamic from "next/dynamic";

// Dynamic imports para SSR safety
const Scene = dynamic(() => import("./Scene").then((mod) => mod.Scene), {
  ssr: false,
});
const DNAHelix = dynamic(() => import("./DNAHelix").then((mod) => mod.DNAHelix), {
  ssr: false,
});
const Particles = dynamic(() => import("./Particles").then((mod) => mod.Particles), {
  ssr: false,
});

interface DNASceneProps {
  className?: string;
}

export function DNAScene({ className }: DNASceneProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Scene>
        <DNAHelix speed={0.3} />
        <Particles count={400} spread={12} />
      </Scene>
    </div>
  );
}

export default DNAScene;
