import { useCallback, useState } from 'react';
import { Upload, ImagePlus } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg'];

export function DropZone({ onFilesSelected, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const valid = Array.from(fileList).filter((f) => ACCEPTED.includes(f.type));
      if (valid.length) onFilesSelected(valid);
    },
    [onFilesSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled) handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`
        relative rounded-xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer
        ${isDragging ? 'border-primary bg-primary/5 glow-primary scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-secondary/30'}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
      `}
      onClick={() => {
        if (disabled) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = ACCEPTED.join(',');
        input.onchange = () => input.files && handleFiles(input.files);
        input.click();
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-secondary p-4">
          {isDragging ? (
            <ImagePlus className="h-8 w-8 text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="text-lg font-medium text-foreground">
            {isDragging ? 'Solte as imagens aqui' : 'Arraste imagens ou clique para selecionar'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">PNG, JPG, JPEG — múltiplos arquivos permitidos</p>
        </div>
      </div>
    </div>
  );
}
