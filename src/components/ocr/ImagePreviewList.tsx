import { X, FileImage, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewListProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function ImagePreviewList({ files, onRemove }: ImagePreviewListProps) {
  if (!files.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Images className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground/80">
          {files.length} {files.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {files.map((file, i) => (
          <div
            key={`${file.name}-${i}`}
            className="group relative rounded-xl overflow-hidden border border-border/60 bg-secondary/20 card-hover shadow-sm"
          >
            <div className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-sm">
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-9 w-9 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-200"
                  onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-2 flex items-center gap-1.5 border-t border-border/40">
              <FileImage className="h-3.5 w-3.5 text-primary/70 shrink-0" />
              <span className="text-xs text-muted-foreground truncate">{file.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
