"use client"

import { useEffect, useRef, useState } from "react"
import createGlobe from "cobe"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Dna, Activity, Globe, Zap } from "lucide-react"

interface GlobeMarker {
  location: [number, number]
  size: number
  label?: string
}

interface InteractiveGlobeProps {
  markers?: GlobeMarker[]
  stats?: {
    totalAgents: number
    activeAgents: number
    totalBreedings: number
  }
  className?: string
}

// Default markers for demo (agent locations worldwide)
const defaultMarkers: GlobeMarker[] = [
  { location: [40.7128, -74.006], size: 0.08, label: "New York" },
  { location: [51.5074, -0.1278], size: 0.07, label: "London" },
  { location: [35.6762, 139.6503], size: 0.09, label: "Tokyo" },
  { location: [-23.5505, -46.6333], size: 0.06, label: "São Paulo" },
  { location: [1.3521, 103.8198], size: 0.07, label: "Singapore" },
  { location: [55.7558, 37.6173], size: 0.05, label: "Moscow" },
  { location: [19.4326, -99.1332], size: 0.08, label: "CDMX" },
  { location: [28.6139, 77.209], size: 0.06, label: "Delhi" },
  { location: [-33.8688, 151.2093], size: 0.05, label: "Sydney" },
  { location: [48.8566, 2.3522], size: 0.06, label: "Paris" },
  { location: [37.5665, 126.978], size: 0.07, label: "Seoul" },
  { location: [25.2048, 55.2708], size: 0.05, label: "Dubai" },
]

// Convert lat/lng to 3D position for arcs
function locationToAngles(lat: number, lng: number): [number, number] {
  return [
    Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2),
    (lat * Math.PI) / 180,
  ]
}

export function InteractiveGlobe({ 
  markers = defaultMarkers, 
  stats,
  className = "" 
}: InteractiveGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    let phi = 0
    let width = 0
    
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth
      }
    }
    
    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.15, 0.18, 0.25],
      markerColor: [0.1, 0.8, 1],
      glowColor: [0.08, 0.5, 0.8],
      markers: markers.map((m) => ({
        location: m.location,
        size: m.size,
      })),
      onRender: (state) => {
        if (!pointerInteracting.current) {
          phi += 0.003
        }
        state.phi = phi + rotation
        state.width = width * 2
        state.height = width * 2
      },
    })

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1"
      }
    }, 100)

    return () => {
      globe.destroy()
      window.removeEventListener("resize", onResize)
    }
  }, [markers, rotation])

  return (
    <section className={"relative w-full overflow-hidden " + className}>
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Badge 
              variant="outline" 
              className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 gap-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              All systems operational
            </Badge>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-foreground">Global Agent</span>
              <br />
              <span className="gradient-text">Network</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-md">
              AI agents evolving across 150+ locations worldwide. 
              Connect with the nearest agent in under 50ms. 
              Drag the globe to explore.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl md:text-4xl font-bold text-foreground">
                  {stats?.totalAgents || 150}+
                </div>
                <div className="text-sm text-muted-foreground leading-tight">
                  Active<br />Agents
                </div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="flex items-center gap-3">
                <div className="text-3xl md:text-4xl font-bold text-foreground">
                  &lt;50ms
                </div>
                <div className="text-sm text-muted-foreground leading-tight">
                  Avg<br />Latency
                </div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="flex items-center gap-3">
                <div className="text-3xl md:text-4xl font-bold text-foreground">
                  {stats?.totalBreedings || 99}.9%
                </div>
                <div className="text-sm text-muted-foreground leading-tight">
                  Breeding<br />Success
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative aspect-square max-w-[500px] mx-auto lg:ml-auto"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl opacity-50" />
            
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-grab active:cursor-grabbing opacity-0 transition-opacity duration-1000"
              style={{
                contain: "layout paint size",
              }}
              onPointerDown={(e) => {
                pointerInteracting.current = e.clientX - pointerInteractionMovement.current
                if (canvasRef.current) {
                  canvasRef.current.style.cursor = "grabbing"
                }
              }}
              onPointerUp={() => {
                pointerInteracting.current = null
                if (canvasRef.current) {
                  canvasRef.current.style.cursor = "grab"
                }
              }}
              onPointerOut={() => {
                pointerInteracting.current = null
                if (canvasRef.current) {
                  canvasRef.current.style.cursor = "grab"
                }
              }}
              onMouseMove={(e) => {
                if (pointerInteracting.current !== null) {
                  const delta = e.clientX - pointerInteracting.current
                  pointerInteractionMovement.current = delta
                  setRotation(delta / 200)
                }
              }}
              onTouchMove={(e) => {
                if (pointerInteracting.current !== null && e.touches[0]) {
                  const delta = e.touches[0].clientX - pointerInteracting.current
                  pointerInteractionMovement.current = delta
                  setRotation(delta / 100)
                }
              }}
            />

            {/* Floating labels */}
            <div className="absolute top-[15%] right-[10%] text-xs text-cyan-400 animate-pulse">
              • Tokyo
            </div>
            <div className="absolute bottom-[25%] right-[5%] text-xs text-cyan-400 animate-pulse delay-300">
              • Singapore
            </div>
            <div className="absolute top-[40%] left-[5%] text-xs text-cyan-400 animate-pulse delay-500">
              • CDMX
            </div>
            <div className="absolute bottom-[35%] left-[15%] text-xs text-cyan-400 animate-pulse delay-700">
              • São Paulo
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
