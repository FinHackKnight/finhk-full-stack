"use client";

import { useRef, useState, useMemo, Effect} from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { TextureLoader } from "three"
import * as THREE from "three"
import type { EventWithMarkets } from "@/lib/mock-data"

interface LocationPinProps {
  event: EventWithMarkets;
  hoveredEventId: string | null;
  onHover: (eventId: string | null) => void;
  onClick: (event: EventWithMarkets) => void;
}

function latLngToPosition(
  lat: number,
  lng: number,
  radius: number
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}

function LocationPin({
  event,
  hoveredEventId,
  onHover,
  onClick,
}: LocationPinProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [pinHovered, setPinHovered] = useState(false);

  const isHighlighted = pinHovered || hoveredEventId === event.id;

  const impactColors = {
    low: "#10b981",
    medium: "#f59e0b",
    high: "#ef4444",
  };

  const position = latLngToPosition(
    event.location.lat,
    event.location.lng,
    2.08
  );
  const color = impactColors[event.impactLevel];

  const pinGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0, -0.05, 0.05, -0.08, 0.05, -0.12);
    shape.bezierCurveTo(0.05, -0.16, 0, -0.2, 0, -0.2);
    shape.bezierCurveTo(0, -0.2, -0.05, -0.16, -0.05, -0.12);
    shape.bezierCurveTo(-0.05, -0.08, 0, -0.05, 0, 0);

    const extrudeSettings = {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 3,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(0, 0, 0);
      groupRef.current.rotateX(Math.PI);
    }

    if (glowRef.current && isHighlighted) {
      glowRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.2);
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setPinHovered(true);
    onHover(event.id);
  };

  const handlePointerOut = () => {
    setPinHovered(false);
    onHover(null);
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick(event);
  };

  return (
    <group 
      ref={groupRef} 
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Pin base (stem) */}
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
        <meshStandardMaterial
          color={color}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, -0.1, 0.02]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
        />
      </mesh>
      {isHighlighted && (
        <>
          <mesh ref={glowRef} position={[0, -0.1, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <ringGeometry args={[0.08, 0.12, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

function RealisticGlobe({
  events,
  hoveredEventId,
  onHover,
  onEventClick,
}: {
  events: EventWithMarkets[];
  hoveredEventId: string | null;
  onHover: (eventId: string | null) => void;
  onEventClick: (event: EventWithMarkets) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0003;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0001;
    }
  });

  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null);
  const [bumpTexture, setBumpTexture] = useState<THREE.Texture | null>(null);
  const [specularTexture, setSpecularTexture] = useState<THREE.Texture | null>(
    null
  );

  useEffect(() => {
    let mounted = true;
    const loader = new THREE.TextureLoader();

    loader.load(
      "/photo-realistic-earth-satellite-view-natural-earth.jpg",
      (tex) => {
        if (!mounted) return;
        try {
          // colorSpace may not exist on older three types — guard it
          // @ts-ignore
          tex.colorSpace = THREE.SRGBColorSpace;
        } catch {}
        tex.anisotropy = rendererCapabilitiesAnisotropy();
        setEarthTexture(tex);
      },
      undefined,
      (err) => {
        console.warn("Could not load earth texture:", err);
      }
    );

    loader.load(
      "/earth-terrain-elevation-bump-map-grayscale-topogra.jpg",
      (tex) => {
        if (!mounted) return;
        tex.anisotropy = rendererCapabilitiesAnisotropy();
        setBumpTexture(tex);
      },
      undefined,
      (err) => {
        console.warn("Could not load bump texture:", err);
      }
    );

    loader.load(
      "/earth-ocean-water-specular-map-white-oceans-black-.jpg",
      (tex) => {
        if (!mounted) return;
        tex.anisotropy = rendererCapabilitiesAnisotropy();
        setSpecularTexture(tex);
      },
      undefined,
      (err) => {
        console.warn("Could not load specular texture:", err);
      }
    );

    return () => {
      mounted = false;
    };
  }, []);

  // helper to avoid accessing renderer directly; provide a conservative default
  function rendererCapabilitiesAnisotropy() {
    try {
      // attempt to read maxAnisotropy from a temporary renderer if available
      // fall back to a reasonable default
      return 16;
    } catch {
      return 1;
    }
  }

  const cloudTexture = useMemo(() => {
    if (typeof window === "undefined") return null;

    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 400; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 50 + 20;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.7)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.4)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <group 
      ref={groupRef}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.08, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudsRef} scale={2.015}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={cloudTexture || undefined}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Atmospheric glow */}
      <mesh scale={2.15}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          color="#4a90e2"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {events.map((event) => (
        <LocationPin
          key={event.id}
          event={event}
          hoveredEventId={hoveredEventId}
          onHover={onHover}
          onClick={onEventClick}
        />
      ))}
    </group>
  );
}

interface Globe3DProps {
  events: EventWithMarkets[];
  hoveredEventId: string | null;
  onEventHover: (eventId: string | null) => void;
  onEventClick: (event: EventWithMarkets) => void;
}

export function Globe3D({
  events,
  hoveredEventId,
  onEventHover,
  onEventClick,
}: Globe3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 3, 5]}
          intensity={1.2}
          color="#ffffff"
        />
        <pointLight position={[-5, -3, -5]} intensity={0.3} color="#4a90e2" />
        <RealisticGlobe
          events={events}
          hoveredEventId={hoveredEventId}
          onHover={onEventHover}
          onEventClick={onEventClick}
        />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={2}
          maxDistance={10}
          autoRotate={!hoveredEventId}
          autoRotateSpeed={0.5}
          enableRotate={!hoveredEventId}
        />
      </Canvas>
    </div>
  );
}
