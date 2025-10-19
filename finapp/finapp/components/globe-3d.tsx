"use client";

import { useRef, useState, useMemo, useEffect} from "react"
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
        <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        <meshStandardMaterial
          color={color}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Pin head */}
      <group position={[0, 0.2, 0]}>
        {/* Main sphere */}
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isHighlighted ? 0.6 : 0.2}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>

        {/* Inner glow */}
        <mesh scale={0.8}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={isHighlighted ? 0.4 : 0.2}
          />
        </mesh>

        {/* Outer glow and effects for highlighted state */}
        {isHighlighted && (
          <>
            <mesh ref={glowRef}>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <mesh>
              <ringGeometry args={[0.1, 0.13, 32]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.2}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </>
        )}
      </group>
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
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Load textures
  const earthTexture = useLoader(TextureLoader, "/assets/3d/texture_earth.jpg");

  // Create procedural cloud texture
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

  // Rotate the Earth and clouds
  useFrame((state, delta) => {
    if (groupRef.current && !hoveredEventId) {
      groupRef.current.rotation.y += delta * 0.1;
    }
    if (cloudsRef.current && !hoveredEventId) {
      cloudsRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Earth sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.08, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudsRef} scale={1.02}>
        <sphereGeometry args={[2.08, 32, 32]} />
        <meshStandardMaterial
          map={cloudTexture || undefined}
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmospheric glow */}
      <mesh scale={1.1}>
        <sphereGeometry args={[2.08, 64, 64]} />
        <meshBasicMaterial
          color="#4a90e2"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
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
