"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export const ParticleField = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const particles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            bottom: '-10px',
            width: particle.size,
            height: particle.size,
            background: particle.id % 2 === 0 
              ? 'hsl(180 100% 50%)' 
              : 'hsl(320 100% 50%)',
            boxShadow: particle.id % 2 === 0 
              ? '0 0 6px hsl(180 100% 50%)' 
              : '0 0 6px hsl(320 100% 50%)',
          }}
          animate={{
            y: [0, -1200],
            x: [0, Math.sin(particle.id) * 50],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};
