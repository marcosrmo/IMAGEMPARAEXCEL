import { X, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewListProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function ImagePreviewList({ files, onRemove }: ImagePreviewListProps) {
  if (!files.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        {files.length} {files.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {files.map((file, i) => (
          <div key={`${file.name}-${i}`} className="group relative rounded-lg overflow-hidden border border-border bg-secondary/30">
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="h-28 w-full object-cover"
            />
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={(e) => { e.stopPropagation(); onRemove(i); }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-2 flex items-center gap-1.5">
              <FileImage className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate">{file.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
