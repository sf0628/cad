import { motion } from 'framer-motion';

export const Logo = () => {
  return (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo icon */}
      <div className="relative">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          {/* Hexagon outline */}
          <path
            d="M20 2L37 11V29L20 38L3 29V11L20 2Z"
            stroke="url(#logo-gradient)"
            strokeWidth="2"
            fill="none"
          />
          {/* Inner forge symbol */}
          <path
            d="M20 10L28 15V25L20 30L12 25V15L20 10Z"
            fill="url(#logo-gradient)"
            opacity="0.3"
          />
          <path
            d="M20 14V26M14 17L20 14L26 17M14 23L20 26L26 23"
            stroke="url(#logo-gradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(180 100% 50%)" />
              <stop offset="100%" stopColor="hsl(320 100% 50%)" />
            </linearGradient>
          </defs>
        </svg>
        {/* Glow effect */}
        <div className="absolute inset-0 blur-md opacity-50">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 2L37 11V29L20 38L3 29V11L20 2Z"
              stroke="hsl(180 100% 50%)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>
      
      {/* Logo text */}
      <div className="flex flex-col">
        <span className="font-mono font-bold text-xl tracking-wider text-gradient-cyber">
          FORGE
        </span>
        <span className="font-mono text-xs text-muted-foreground tracking-widest">
          AI DESIGN
        </span>
      </div>
    </motion.div>
  );
};
