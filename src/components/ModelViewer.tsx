"use client";

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface ModelViewerProps {
  geometry: THREE.BufferGeometry | null;
  isLoading?: boolean;
}

const CyberpunkLighting = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f0ff" />
      <pointLight position={[10, -5, 10]} intensity={0.3} color="#ff00aa" />
      <spotLight
        position={[0, 20, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        color="#9d00ff"
      />
    </>
  );
};

const Model = ({ geometry }: { geometry: THREE.BufferGeometry }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  // Center the geometry
  useEffect(() => {
    if (geometry) {
      geometry.computeBoundingBox();
      geometry.center();
    }
  }, [geometry]);

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color="#888888"
        metalness={0.3}
        roughness={0.4}
        envMapIntensity={0.5}
      />
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#00f0ff" opacity={0.3} transparent />
      </lineSegments>
    </mesh>
  );
};

const CyberGrid = () => {
  return (
    <Grid
      position={[0, -2, 0]}
      args={[20, 20]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#1a1a2e"
      sectionSize={5}
      sectionThickness={1}
      sectionColor="#00f0ff"
      fadeDistance={30}
      fadeStrength={1}
      followCamera={false}
    />
  );
};

const LoadingIndicator = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.7;
    }
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#00f0ff"
        wireframe
        emissive="#00f0ff"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

export const ModelViewer = ({ geometry, isLoading = false }: ModelViewerProps) => {
  return (
    <motion.div
      className="relative w-full h-full min-h-[400px] bg-card/50 rounded-lg border border-border overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary z-10" />
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary z-10" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary z-10" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary z-10" />

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />
        <CyberpunkLighting />
        <CyberGrid />
        
        {isLoading ? (
          <LoadingIndicator />
        ) : geometry ? (
          <Model geometry={geometry} />
        ) : (
          <LoadingIndicator />
        )}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={30}
        />
        <fog attach="fog" args={['#0a0a0f', 15, 40]} />
      </Canvas>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 text-xs font-mono text-muted-foreground bg-background/80 px-3 py-1.5 rounded backdrop-blur-sm">
        Drag to rotate • Scroll to zoom • Shift+drag to pan
      </div>
    </motion.div>
  );
};
