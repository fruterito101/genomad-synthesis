"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Colores ATGC con brillo
const TRAIT_COLORS = {
  A: "#2ECC71", // Adenine - verde
  T: "#E74C3C", // Thymine - rojo
  G: "#F1C40F", // Guanine - amarillo
  C: "#3498DB", // Cytosine - azul
};

interface DNAHelixProps {
  speed?: number;
  radius?: number;
  height?: number;
  turns?: number;
}

export function DNAHelix({
  speed = 0.3,
  radius = 1.5,
  height = 8,
  turns = 3,
}: DNAHelixProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRefs = useRef<THREE.MeshStandardMaterial[]>([]);

  // Generar geometría de la doble hélice
  const { strand1, strand2, connections } = useMemo(() => {
    const points1: THREE.Vector3[] = [];
    const points2: THREE.Vector3[] = [];
    const conns: { start: THREE.Vector3; end: THREE.Vector3; color: string }[] = [];
    
    const segments = 100;
    const bases = ["A", "T", "G", "C"];
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;
      
      // Strand 1
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      points1.push(new THREE.Vector3(x1, y, z1));
      
      // Strand 2 (180° offset)
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;
      points2.push(new THREE.Vector3(x2, y, z2));
      
      // Conexiones entre strands (cada 10 segmentos)
      if (i % 10 === 0 && i > 0 && i < segments) {
        const baseIndex = Math.floor(Math.random() * 4);
        conns.push({
          start: new THREE.Vector3(x1, y, z1),
          end: new THREE.Vector3(x2, y, z2),
          color: TRAIT_COLORS[bases[baseIndex] as keyof typeof TRAIT_COLORS],
        });
      }
    }
    
    return { strand1: points1, strand2: points2, connections: conns };
  }, [radius, height, turns]);

  // Crear curvas para TubeGeometry
  const curve1 = useMemo(() => new THREE.CatmullRomCurve3(strand1), [strand1]);
  const curve2 = useMemo(() => new THREE.CatmullRomCurve3(strand2), [strand2]);

  // Animación de rotación y pulso de luz
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += speed * 0.01;
    }
    
    // Pulso de emisión
    const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
    materialRefs.current.forEach((mat) => {
      if (mat) {
        mat.emissiveIntensity = pulse;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Strand 1 - Verde brillante */}
      <mesh>
        <tubeGeometry args={[curve1, 100, 0.08, 8, false]} />
        <meshStandardMaterial
          ref={(el) => el && (materialRefs.current[0] = el)}
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Strand 2 - Azul brillante */}
      <mesh>
        <tubeGeometry args={[curve2, 100, 0.08, 8, false]} />
        <meshStandardMaterial
          ref={(el) => el && (materialRefs.current[1] = el)}
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Conexiones con colores ATGC */}
      {connections.map((conn, i) => {
        const midPoint = new THREE.Vector3()
          .addVectors(conn.start, conn.end)
          .multiplyScalar(0.5);
        const direction = new THREE.Vector3().subVectors(conn.end, conn.start);
        const length = direction.length();
        
        return (
          <mesh
            key={i}
            position={midPoint}
            rotation={[0, 0, Math.atan2(direction.y, direction.x)]}
          >
            <cylinderGeometry args={[0.04, 0.04, length, 8]} />
            <meshStandardMaterial
              color={conn.color}
              emissive={conn.color}
              emissiveIntensity={0.8}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}
