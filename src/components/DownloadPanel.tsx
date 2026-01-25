import { Download, FileText, Box, Image } from 'lucide-react';
import { CyberButton } from './CyberButton';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface DownloadPanelProps {
  stlBlob: Blob | null;
  markdown: string;
  onCaptureRender: () => void;
  isGenerating: boolean;
}

export const DownloadPanel = ({ 
  stlBlob, 
  markdown, 
  onCaptureRender,
  isGenerating 
}: DownloadPanelProps) => {
  
  const downloadSTL = () => {
    if (!stlBlob) {
      toast.error('STL file not ready');
      return;
    }
    
    const url = URL.createObjectURL(stlBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'forge-design.stl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('STL file downloaded');
  };

  const downloadMarkdown = () => {
    if (!markdown) {
      toast.error('Documentation not ready');
      return;
    }
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'forge-design-report.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Documentation downloaded');
  };

  return (
    <motion.div
      className="bg-card/50 rounded-lg border border-border p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-4">
        Downloads
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CyberButton
          variant="outline"
          onClick={downloadSTL}
          disabled={isGenerating || !stlBlob}
          className="flex items-center gap-2"
        >
          <Box className="w-4 h-4" />
          Download STL
        </CyberButton>
        
        <CyberButton
          variant="outline"
          onClick={downloadMarkdown}
          disabled={isGenerating || !markdown}
          glowColor="magenta"
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Download Report
        </CyberButton>
        
        <CyberButton
          variant="outline"
          onClick={onCaptureRender}
          disabled={isGenerating || !stlBlob}
          glowColor="purple"
          className="flex items-center gap-2"
        >
          <Image className="w-4 h-4" />
          Save Render
        </CyberButton>
      </div>
    </motion.div>
  );
};
