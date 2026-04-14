import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProcessingProgressProps {
  current: number;
  total: number;
  currentFileName: string;
}

export function ProcessingProgress({ current, total, currentFileName }: ProcessingProgressProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-medium text-foreground">
          Processando {current + 1} de {total}
        </span>
      </div>
      {currentFileName && (
        <p className="text-xs text-muted-foreground truncate">Arquivo: {currentFileName}</p>
      )}
      <Progress value={pct} className="h-2" />
      <p className="text-right text-xs text-muted-foreground">{pct}%</p>
    </div>
  );
}
