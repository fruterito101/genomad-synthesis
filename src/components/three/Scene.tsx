"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, ReactNode } from "react";

interface SceneProps {
  children: ReactNode;
}

export function Scene({ children }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        {/* Fog volumétrico */}
        <fog attach="fog" args={["#0a0a0a", 5, 25]} />
        
        {/* Sistema de iluminación 3 puntos */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#22c55e" />
        <pointLight position={[0, -10, 5]} intensity={0.3} color="#3b82f6" />
        
        {children}
      </Suspense>
    </Canvas>
  );
}
