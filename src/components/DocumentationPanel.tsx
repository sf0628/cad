"use client";

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DocumentationPanelProps {
  markdown: string;
  isLoading?: boolean;
}

export const DocumentationPanel = ({ markdown, isLoading = false }: DocumentationPanelProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.success('Documentation copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <motion.div
        className="h-full bg-card/50 rounded-lg border border-border p-6 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="h-full bg-card/50 rounded-lg border border-border overflow-hidden flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50">
        <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
          Engineering Documentation
        </h3>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-muted rounded-md transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-primary" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="prose prose-invert prose-sm max-w-none
          prose-headings:font-mono prose-headings:text-foreground
          prose-h1:text-2xl prose-h1:border-b prose-h1:border-border prose-h1:pb-2
          prose-h2:text-xl prose-h2:text-primary prose-h2:mt-8
          prose-h3:text-lg prose-h3:text-secondary
          prose-p:text-muted-foreground prose-p:leading-relaxed
          prose-ul:text-muted-foreground
          prose-li:marker:text-primary
          prose-strong:text-foreground
          prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-muted prose-pre:border prose-pre:border-border
        ">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};
