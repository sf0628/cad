import { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CyberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const CyberInput = forwardRef<HTMLInputElement, CyberInputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <motion.div
        className="relative w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {label && (
          <label className="block text-sm font-mono text-muted-foreground mb-2 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            className={cn(
              "w-full px-6 py-4 bg-card/50 border border-border rounded-lg",
              "text-foreground placeholder:text-muted-foreground",
              "font-mono text-lg",
              "focus:outline-none focus:border-primary",
              "transition-all duration-300",
              "backdrop-blur-sm",
              "group-hover:border-primary/50",
              className
            )}
            {...props}
          />
          {/* Glow effect on focus */}
          <div className="absolute inset-0 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none neon-border" />
        </div>
      </motion.div>
    );
  }
);

CyberInput.displayName = 'CyberInput';
