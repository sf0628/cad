"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Box, Wrench, Layers } from 'lucide-react';
import { CyberInput } from './CyberInput';
import { CyberSelect } from './CyberSelect';
import { CyberButton } from './CyberButton';
import { ParticleField } from './ParticleField';
import { Logo } from './Logo';
import { toast } from 'sonner';

const productTypes = [
  { value: 'enclosure', label: 'Enclosure' },
  { value: 'bracket', label: 'Bracket' },
  { value: 'mount', label: 'Mount' },
  { value: 'connector', label: 'Connector' },
  { value: 'handle', label: 'Handle' },
  { value: 'plate', label: 'Flat Plate' },
];

const useCases = [
  { value: 'prototype', label: 'Prototype' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'concept', label: 'Concept Art' },
];

const complexityLevels = [
  { value: 'low', label: 'Low - Simple geometry' },
  { value: 'medium', label: 'Medium - Multi-feature' },
  { value: 'high', label: 'High - Detailed' },
];

export const HeroSection = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [productType, setProductType] = useState('enclosure');
  const [useCase, setUseCase] = useState('prototype');
  const [complexity, setComplexity] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a design description');
      return;
    }

    setIsLoading(true);
    
    // Store form data for the generate page
    const formData = {
      prompt: prompt.trim(),
      productType,
      useCase,
      complexity,
    };
    
    // Store in sessionStorage and navigate with URL params
    sessionStorage.setItem('generateFormData', JSON.stringify(formData));
    router.push(`/generate?prompt=${encodeURIComponent(formData.prompt)}&productType=${encodeURIComponent(formData.productType)}&useCase=${encodeURIComponent(formData.useCase)}&complexity=${encodeURIComponent(formData.complexity)}`);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-visible">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute inset-0 scanlines opacity-20" />
      <ParticleField />
      
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-neon-cyan/5 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-neon-magenta/5 to-transparent blur-3xl" />

      {/* Header */}
      <motion.div 
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo />
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Subtle title */}
        <motion.h2
          className="text-center mb-8 font-mono text-lg md:text-xl font-normal"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* <span className="text-foreground/70">3D Print Your </span> */}
          <span className="text-gradient-cyber">3D Print Your Ideas</span>
        </motion.h2>

        {/* Feature badges - now the visual focal point */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {[
            { icon: Box, label: 'STL Export' },
            { icon: Layers, label: '3D Preview' },
            // { icon: Wrench, label: 'Parametric' },
            { icon: Zap, label: 'AI-Powered' },
          ].map((feature, i) => (
            <div
              key={feature.label}
              className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-full border border-border"
            >
              <feature.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono text-muted-foreground">{feature.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Input form */}
        <motion.div
          className="bg-card/30 backdrop-blur-md rounded-2xl border border-border p-6 md:p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Main prompt input */}
          <div className="mb-6">
            <CyberInput
              label="Design Description"
              placeholder="e.g., A ventilated electronics enclosure for a Raspberry Pi, 100mm x 60mm x 30mm"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {/* Dropdowns grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <CyberSelect
              label="Product Type"
              options={productTypes}
              value={productType}
              onValueChange={setProductType}
            />
            <CyberSelect
              label="Use Case"
              options={useCases}
              value={useCase}
              onValueChange={setUseCase}
            />
            <CyberSelect
              label="Complexity"
              options={complexityLevels}
              value={complexity}
              onValueChange={setComplexity}
            />
          </div>

          {/* Generate button */}
          <div className="flex justify-center">
            <CyberButton
              size="lg"
              onClick={handleGenerate}
              isLoading={isLoading}
              className="min-w-[250px] neon-pulse"
            >
              <Sparkles className="w-5 h-5" />
              GENERATE DESIGN
            </CyberButton>
          </div>
        </motion.div>

        {/* Example prompts */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-sm text-muted-foreground mb-3">Try these examples:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Raspberry Pi 4 case with cooling vents',
              'Wall-mounted sensor bracket',
              'Cable management clip with hook',
            ].map((example) => (
              <button
                key={example}
                onClick={() => setPrompt(example)}
                className="px-3 py-1.5 text-xs font-mono text-muted-foreground bg-card/50 hover:bg-card border border-border hover:border-primary/50 rounded-full transition-all duration-300"
              >
                {example}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
