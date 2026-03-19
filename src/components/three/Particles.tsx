"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticlesProps {
  count?: number;
  spread?: number;
}

// Simple noise function
function noise(x: number, y: number, z: number): number {
  return Math.sin(x * 1.5) * Math.cos(y * 1.5) * Math.sin(z * 1.5);
}

export function Particles({ count = 500, spread = 15 }: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Posiciones y velocidades iniciales
  const { positions, velocities, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * spread;
      pos[i3 + 1] = (Math.random() - 0.5) * spread;
      pos[i3 + 2] = (Math.random() - 0.5) * spread;
      
      vel[i3] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.02;
      
      // Colores verdes/azules
      const isGreen = Math.random() > 0.5;
      if (isGreen) {
        cols[i3] = 0.13;     // R
        cols[i3 + 1] = 0.77; // G
        cols[i3 + 2] = 0.37; // B
      } else {
        cols[i3] = 0.23;
        cols[i3 + 1] = 0.51;
        cols[i3 + 2] = 0.96;
      }
    }
    
    return { positions: pos, velocities: vel, colors: cols };
  }, [count, spread]);

  // Animación orgánica
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Movimiento basado en noise
      const nx = noise(posArray[i3] * 0.1, time * 0.3, 0);
      const ny = noise(0, posArray[i3 + 1] * 0.1, time * 0.3);
      const nz = noise(time * 0.3, 0, posArray[i3 + 2] * 0.1);
      
      posArray[i3] += velocities[i3] + nx * 0.01;
      posArray[i3 + 1] += velocities[i3 + 1] + ny * 0.01;
      posArray[i3 + 2] += velocities[i3 + 2] + nz * 0.01;
      
      // Wrap around
      const halfSpread = spread / 2;
      if (Math.abs(posArray[i3]) > halfSpread) posArray[i3] *= -0.9;
      if (Math.abs(posArray[i3 + 1]) > halfSpread) posArray[i3 + 1] *= -0.9;
      if (Math.abs(posArray[i3 + 2]) > halfSpread) posArray[i3 + 2] *= -0.9;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  // Crear geometría con useMemo
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
