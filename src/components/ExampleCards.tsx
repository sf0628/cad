"use client";

import { motion } from 'framer-motion';
import { Box, Layers, Wrench, Zap, Cpu, Cable, Gauge } from 'lucide-react';

interface ExampleCard {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const examples: ExampleCard[] = [
  {
    id: 1,
    title: 'Generation 1',
    description: 'Electronics enclosure with precision ventilation and mounting points',
    icon: Box,
    gradient: 'from-primary/20 to-primary/5',
  },
  {
    id: 2,
    title: 'Generation 2',
    description: 'Structural bracket with optimized weight distribution and strength',
    icon: Wrench,
    gradient: 'from-accent/20 to-accent/5',
  },
  {
    id: 3,
    title: 'Generation 3',
    description: 'Cylindrical mount with integrated cable management and alignment tabs',
    icon: Layers,
    gradient: 'from-secondary/20 to-secondary/5',
  },
  {
    id: 4,
    title: 'Generation 4',
    description: 'Custom connector with multi-port configuration and snap-fit design',
    icon: Cable,
    gradient: 'from-primary/20 to-accent/5',
  },
  {
    id: 5,
    title: 'Generation 5',
    description: 'Sensor housing with environmental protection and modular mounting',
    icon: Cpu,
    gradient: 'from-accent/20 to-secondary/5',
  },
  {
    id: 6,
    title: 'Generation 6',
    description: 'Precision plate with grid pattern and rounded corner optimization',
    icon: Gauge,
    gradient: 'from-secondary/20 to-primary/5',
  },
];

export const ExampleCards = () => {
  return (
    <section className="relative w-full py-20 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-neon-cyan/3 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-neon-magenta/3 to-transparent blur-3xl" />

      <div className="relative z-10 container mx-auto max-w-7xl">
        {/* Section title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-mono text-2xl md:text-3xl font-bold mb-3 text-foreground">
            Explore <span className="text-gradient-cyber">Designs</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground font-mono">
            Explore AI-generated 3D designs across various use cases
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((example, index) => (
            <motion.div
              key={example.id}
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative h-full bg-card/30 backdrop-blur-md rounded-xl border border-border p-6 transition-all duration-300 hover:border-primary/50 hover:bg-card/50 hover:shadow-[0_0_20px_hsl(180_100%_50%_/_0.1)]">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary/30 group-hover:border-primary transition-colors" />
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary/30 group-hover:border-primary transition-colors" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary/30 group-hover:border-primary transition-colors" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary/30 group-hover:border-primary transition-colors" />

                {/* Gradient background */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${example.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-300">
                      <example.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-mono font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
                    {example.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                    {example.description}
                  </p>

                  {/* Hover indicator */}
                  <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs font-mono text-primary">View Details →</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
