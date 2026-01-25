import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
    
    // Navigate to generate page with state
    navigate('/generate', { state: formData });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
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
        {/* Hero text */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-mono text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-foreground">Transform Ideas Into</span>
            <br />
            <span className="text-gradient-cyber neon-glow">Tangible Designs</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered parametric design generator. Describe your engineering vision
            and get downloadable STL files, documentation, and 3D previews.
          </p>
        </motion.div>

        {/* Feature badges */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {[
            { icon: Box, label: 'STL Export' },
            { icon: Layers, label: '3D Preview' },
            { icon: Wrench, label: 'Parametric' },
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
