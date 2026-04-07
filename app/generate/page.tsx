"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw } from "lucide-react";
import * as THREE from "three";
import { toast } from "sonner";

import { Logo } from "@/components/Logo";
import { CyberButton } from "@/components/CyberButton";
import { ModelViewer } from "@/components/ModelViewer";
import { DocumentationPanel } from "@/components/DocumentationPanel";
import { LoadingState } from "@/components/LoadingState";
import { DownloadPanel } from "@/components/DownloadPanel";
import { ParticleField } from "@/components/ParticleField";
import {
  generateGeometry,
  createSTLBlob,
  TemplateType,
  GenerationParams,
} from "@/lib/stlGenerator";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  prompt: string;
  productType: string;
  useCase: string;
  complexity: string;
}

export default function Generate() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get form data from URL search params or sessionStorage
  const [formData, setFormData] = useState<FormData | null>(null);

  useEffect(() => {
    // Try to get from URL params first
    const prompt = searchParams?.get("prompt");
    const productType = searchParams?.get("productType");
    const useCase = searchParams?.get("useCase");
    const complexity = searchParams?.get("complexity");

    if (prompt && productType && useCase && complexity) {
      setFormData({ prompt, productType, useCase, complexity });
    } else {
      // Fallback to sessionStorage (for navigation from form)
      if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem("generateFormData");
        if (stored) {
          try {
            setFormData(JSON.parse(stored));
          } catch {
            router.push("/");
          }
        } else {
          router.push("/");
        }
      }
    }
  }, [searchParams, router]);

  const [isGenerating, setIsGenerating] = useState(true);
  const [status, setStatus] = useState("Analyzing requirements...");
  const [progress, setProgress] = useState(0);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [stlBlob, setStlBlob] = useState<Blob | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [generationParams, setGenerationParams] =
    useState<GenerationParams | null>(null);

  // Main generation effect
  useEffect(() => {
    if (!formData) return;

    const generate = async () => {
      try {
        setIsGenerating(true);
        setProgress(0);

        // Step 1: Analyze with AI
        setStatus("Analyzing requirements...");
        setProgress(10);

        // Call AI edge function for template selection and parameters
        const { data: aiResult, error: aiError } =
          await supabase.functions.invoke("generate-design", {
            body: {
              prompt: formData.prompt,
              productType: formData.productType,
              useCase: formData.useCase,
              complexity: formData.complexity,
            },
          });

        if (aiError) {
          console.error("AI error:", aiError);
          // Fallback to local generation
          toast.warning("Using local generation (AI unavailable)");
        }

        setStatus("Selecting template...");
        setProgress(30);
        await new Promise((r) => setTimeout(r, 500));

        // Parse AI result or use defaults
        const template: TemplateType =
          aiResult?.template || (formData.productType as TemplateType);
        const params: GenerationParams = {
          template,
          box: aiResult?.box,
          bracket: aiResult?.bracket,
          cylinder: aiResult?.cylinder,
          plate: aiResult?.plate,
          handle: aiResult?.handle,
        };

        setGenerationParams(params);

        setStatus("Generating geometry...");
        setProgress(50);
        await new Promise((r) => setTimeout(r, 500));

        // Generate 3D geometry
        const generatedGeometry = generateGeometry(params);
        setGeometry(generatedGeometry);

        // Create STL blob
        const blob = createSTLBlob(generatedGeometry);
        setStlBlob(blob);

        setStatus("Creating documentation...");
        setProgress(70);

        // Get or generate documentation
        const doc =
          aiResult?.documentation ||
          generateFallbackDocumentation(formData, params);
        setMarkdown(doc);

        setStatus("Rendering preview...");
        setProgress(90);
        await new Promise((r) => setTimeout(r, 500));

        setProgress(100);
        setStatus("Complete!");
        setIsGenerating(false);

        toast.success("Design generated successfully!");
      } catch (error) {
        console.error("Generation error:", error);
        toast.error("Generation failed. Using fallback.");

        // Fallback generation
        const fallbackParams: GenerationParams = {
          template: formData.productType as TemplateType,
        };
        const fallbackGeometry = generateGeometry(fallbackParams);
        setGeometry(fallbackGeometry);
        setStlBlob(createSTLBlob(fallbackGeometry));
        setMarkdown(generateFallbackDocumentation(formData, fallbackParams));
        setIsGenerating(false);
      }
    };

    generate();
  }, [formData]);

  const handleRegenerate = () => {
    if (!formData) return;
    setGeometry(null);
    setStlBlob(null);
    setMarkdown("");
    setIsGenerating(true);
    setProgress(0);
    // Trigger re-generation by updating a key or state
    window.location.reload();
  };

  const handleCaptureRender = () => {
    // Get the canvas element and export as PNG
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = "forge-render.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Render saved!");
    } else {
      toast.error("Could not capture render");
    }
  };

  if (!formData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      <ParticleField />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <Logo />
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono text-sm">Back</span>
          </button>
        </div>

        <CyberButton
          variant="outline"
          size="sm"
          onClick={handleRegenerate}
          disabled={isGenerating}
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </CyberButton>
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Prompt display */}
        <motion.div
          className="mb-6 p-4 bg-card/50 rounded-lg border border-border"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-mono text-sm text-muted-foreground mb-1">
            Generating:
          </p>
          <p className="text-lg text-foreground">{formData.prompt}</p>
          <div className="flex gap-4 mt-2">
            <span className="text-xs font-mono text-primary">
              {formData.productType}
            </span>
            <span className="text-xs font-mono text-accent">
              {formData.useCase}
            </span>
            <span className="text-xs font-mono text-secondary">
              {formData.complexity}
            </span>
          </div>
        </motion.div>

        {isGenerating ? (
          <div className="h-[60vh]">
            <LoadingState status={status} progress={progress} />
          </div>
        ) : (
          <>
            {/* Split view */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* 3D Viewer */}
              <div className="h-[500px]">
                <ModelViewer geometry={geometry} isLoading={isGenerating} />
              </div>

              {/* Documentation */}
              <div className="h-[500px]">
                <DocumentationPanel
                  markdown={markdown}
                  isLoading={isGenerating}
                />
              </div>
            </div>

            {/* Downloads */}
            <DownloadPanel
              stlBlob={stlBlob}
              markdown={markdown}
              onCaptureRender={handleCaptureRender}
              isGenerating={isGenerating}
            />
          </>
        )}
      </main>
    </div>
  );
}

// Fallback documentation generator
function generateFallbackDocumentation(
  formData: FormData,
  params: GenerationParams
): string {
  const now = new Date().toISOString().split("T")[0];

  return `# Text_to_CAD Design Report

## Design Overview

**Generated:** ${now}
**Template:** ${params.template}
**Use Case:** ${formData.useCase}
**Complexity:** ${formData.complexity}

### Description
${formData.prompt}

---

## Design Specifications

### Dimensions
- Based on ${params.template} template
- Optimized for ${formData.useCase} applications
- Complexity level: ${formData.complexity}

### Material Recommendations

| Use Case | Recommended Material | Notes |
|----------|---------------------|-------|
| Prototype | PLA | Easy to print, good for testing |
| Manufacturing | ABS/PETG | Durable, heat resistant |
| Concept | Any | Visual appearance priority |

---

## Manufacturing Notes

### 3D Printing Guidelines

1. **Print Orientation:** Optimal orientation depends on the specific geometry
2. **Layer Height:** 0.2mm recommended for balance of quality and speed
3. **Infill:** 20-30% for prototypes, 50%+ for functional parts
4. **Supports:** May be required depending on overhangs

### Post-Processing

- Light sanding for smooth surfaces
- Consider primer and paint for presentation models
- Thread tapping for mounting holes if needed

---

## Design Rationale

This design was generated based on your specifications for a ${formData.productType} intended for ${formData.useCase} use. The ${formData.complexity} complexity level influenced the level of detail and feature count.

---

## Potential Improvements

1. Add chamfers or fillets for improved strength
2. Consider adding assembly features (snap fits, screw bosses)
3. Optimize wall thickness for your specific material
4. Add branding or labeling surfaces

---

*Generated by Text_to_CAD - AI-Native Engineering Design Tool*
`;
}
