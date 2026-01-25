import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface CyberSelectProps {
  label: string;
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CyberSelect = ({
  label,
  options,
  value,
  onValueChange,
  placeholder = 'Select...',
  className,
}: CyberSelectProps) => {
  return (
    <motion.div
      className={cn("relative", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger 
          className={cn(
            "w-full bg-card/50 border-border backdrop-blur-sm",
            "font-mono text-sm",
            "hover:border-primary/50 focus:border-primary",
            "transition-all duration-300",
            "h-12"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-popover/95 backdrop-blur-md border-border z-50">
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="font-mono text-sm hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
};
