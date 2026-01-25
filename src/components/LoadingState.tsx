import { motion } from 'framer-motion';

interface LoadingStateProps {
  status: string;
  progress?: number;
}

const statusMessages = [
  'Analyzing requirements...',
  'Selecting template...',
  'Extracting parameters...',
  'Generating geometry...',
  'Creating documentation...',
  'Rendering preview...',
];

export const LoadingState = ({ status, progress = 0 }: LoadingStateProps) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full min-h-[400px] p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Animated logo/spinner */}
      <div className="relative w-24 h-24 mb-8">
        <motion.div
          className="absolute inset-0 border-2 border-primary rounded-lg"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          }}
        />
        <motion.div
          className="absolute inset-2 border-2 border-accent rounded-lg"
          animate={{
            rotate: -360,
            scale: [1, 0.9, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
          }}
        />
        <motion.div
          className="absolute inset-4 border-2 border-secondary rounded-lg"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        {/* Center dot */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_hsl(180_100%_50%)]" />
        </motion.div>
      </div>

      {/* Status text */}
      <motion.p
        className="font-mono text-lg text-foreground mb-4"
        key={status}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        {status}
      </motion.p>

      {/* Progress bar */}
      <div className="w-full max-w-md h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-accent to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Progress percentage */}
      <p className="font-mono text-sm text-muted-foreground mt-2">
        {Math.round(progress)}%
      </p>

      {/* Glitch effect on status messages */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {statusMessages.map((msg, i) => (
          <motion.span
            key={msg}
            className={`text-xs font-mono px-2 py-1 rounded ${
              status === msg
                ? 'text-primary bg-primary/10 border border-primary/50'
                : 'text-muted-foreground bg-muted/50'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            {msg}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};
