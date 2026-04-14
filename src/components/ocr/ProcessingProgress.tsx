import { Loader2, Image } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProcessingProgressProps {
  current: number;
  total: number;
  currentFileName: string;
}

export function ProcessingProgress({ current, total, currentFileName }: ProcessingProgressProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-primary/20 bg-card/80 p-6 space-y-5 shadow-lg glow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
            <div className="relative rounded-full gradient-primary p-2">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Analisando imagens com OCR...</p>
            <p className="text-xs text-muted-foreground">
              Imagem {current + 1} de {total}
            </p>
          </div>
        </div>
        <span className="text-2xl font-bold gradient-text">{pct}%</span>
      </div>

      {currentFileName && (
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 border border-border/40">
          <Image className="h-3.5 w-3.5 text-primary/70 shrink-0" />
          <p className="text-xs text-muted-foreground truncate">{currentFileName}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Progress value={pct} className="h-2.5 bg-secondary" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
