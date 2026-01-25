import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface CyberButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  glowColor?: 'cyan' | 'magenta' | 'purple';
}

export const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ 
    className, 
    children, 
    variant = 'primary', 
    size = 'md',
    isLoading = false,
    glowColor = 'cyan',
    disabled,
    ...props 
  }, ref) => {
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const glowColors = {
      cyan: 'hover:shadow-[0_0_20px_hsl(180_100%_50%_/_0.5)]',
      magenta: 'hover:shadow-[0_0_20px_hsl(320_100%_50%_/_0.5)]',
      purple: 'hover:shadow-[0_0_20px_hsl(270_100%_50%_/_0.5)]',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative font-mono font-semibold rounded-lg",
          "transition-all duration-300",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "overflow-hidden",
          variants[variant],
          sizes[size],
          glowColors[glowColor],
          className
        )}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          {children}
        </span>
        
        {/* Animated border glow */}
        {!disabled && !isLoading && variant === 'primary' && (
          <motion.div
            className="absolute inset-0 rounded-lg opacity-0"
            animate={{
              boxShadow: [
                '0 0 10px hsl(180 100% 50% / 0.3)',
                '0 0 20px hsl(180 100% 50% / 0.5)',
                '0 0 10px hsl(180 100% 50% / 0.3)',
              ],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.button>
    );
  }
);

CyberButton.displayName = 'CyberButton';
