"use client";

import { motion } from 'framer-motion';

export const Logo = () => {
  return (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Code bracket logo */}
      <div className="relative">
        <span className="font-mono font-bold text-2xl tracking-wider text-gradient-cyber neon-glow">
          &lt;/&gt;
        </span>
        {/* Glow effect */}
        <div className="absolute inset-0 blur-md opacity-50 -z-10">
          <span className="font-mono font-bold text-2xl tracking-wider text-gradient-cyber">
            &lt;/&gt;
          </span>
        </div>
      </div>
    </motion.div>
  );
};
