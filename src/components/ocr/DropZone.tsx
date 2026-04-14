import { useCallback, useState } from 'react';
import { Upload, ImagePlus, CloudUpload } from 'lucide-react';

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

  const openPicker = () => {
    if (disabled) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = ACCEPTED.join(',');
    input.onchange = () => input.files && handleFiles(input.files);
    input.click();
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={openPicker}
      className={`
        relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer select-none overflow-hidden
        ${isDragging
          ? 'border-primary bg-primary/8 glow-primary scale-[1.01]'
          : 'border-border hover:border-primary/40 hover:bg-primary/3'
        }
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {/* Background glow when dragging */}
      {isDragging && (
        <div className="absolute inset-0 gradient-primary opacity-5 pointer-events-none" />
      )}

      <div className="relative flex flex-col items-center gap-5">
        {/* Icon */}
        <div className={`relative transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
          <div className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-300 ${isDragging ? 'opacity-100 bg-primary/30' : 'opacity-0'}`} />
          <div className={`relative rounded-full p-5 transition-all duration-300 ${isDragging ? 'gradient-primary shadow-lg' : 'bg-secondary border border-border'}`}>
            {isDragging
              ? <ImagePlus className="h-9 w-9 text-white" />
              : <CloudUpload className="h-9 w-9 text-muted-foreground" />
            }
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <p className={`text-xl font-semibold transition-colors duration-200 ${isDragging ? 'text-primary' : 'text-foreground'}`}>
            {isDragging ? 'Solte as imagens aqui!' : 'Arraste imagens ou clique para selecionar'}
          </p>
          <p className="text-sm text-muted-foreground">
            Suporta <span className="text-foreground/70 font-medium">PNG, JPG, JPEG</span> — múltiplos arquivos permitidos
          </p>
        </div>

        {/* Call to action */}
        {!isDragging && (
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-5 py-2 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/15">
            <Upload className="h-3.5 w-3.5" />
            Selecionar arquivos
          </div>
        )}
      </div>
    </div>
  );
}
