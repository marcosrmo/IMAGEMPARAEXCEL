import { useState, useCallback } from 'react';
import { ScanSearch, Play, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropZone } from '@/components/ocr/DropZone';
import { ImagePreviewList } from '@/components/ocr/ImagePreviewList';
import { ProcessingProgress } from '@/components/ocr/ProcessingProgress';
import { DataTable } from '@/components/ocr/DataTable';
import { processImages, type ExtractedRecord } from '@/lib/ocrProcessor';
import { exportToExcel } from '@/lib/excelExport';
import { useToast } from '@/hooks/use-toast';

export default function OCRExtractor() {
  const [files, setFiles] = useState<File[]>([]);
  const [records, setRecords] = useState<ExtractedRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, fileName: '' });
  const { toast } = useToast();

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleProcess = useCallback(async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setRecords([]);

    try {
      const results = await processImages(files, (current, total, fileName) => {
        setProgress({ current, total, fileName });
      });
      setRecords(results);
      const successCount = results.filter((r) => !r.hasError).length;
      toast({
        title: 'Processamento concluído',
        description: `${successCount} de ${results.length} imagens com dados extraídos.`,
      });
    } catch (err) {
      toast({
        title: 'Erro no processamento',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [files, toast]);

  const handleExport = useCallback(() => {
    const validRecords = records.filter((r) => !r.hasError);
    if (!validRecords.length) {
      toast({ title: 'Nenhum dado para exportar', variant: 'destructive' });
      return;
    }
    exportToExcel(validRecords);
    toast({ title: 'Excel exportado!', description: 'O arquivo foi baixado.' });
  }, [records, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto flex items-center gap-3 px-4 py-4">
          <div className="rounded-lg gradient-primary p-2">
            <ScanSearch className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Imagem Para Pdf Leadcompra</h1>
            <p className="text-xs text-muted-foreground">Extraia nomes e telefones de imagens automaticamente</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
        {/* Upload */}
        <DropZone onFilesSelected={handleFilesSelected} disabled={isProcessing} />

        {/* Preview */}
        <ImagePreviewList files={files} onRemove={handleRemove} />

        {/* Actions */}
        {files.length > 0 && !isProcessing && (
          <div className="flex gap-3 flex-wrap">
            <Button onClick={handleProcess} className="gradient-primary text-primary-foreground gap-2 px-6">
              <Play className="h-4 w-4" />
              Processar {files.length} {files.length === 1 ? 'imagem' : 'imagens'}
            </Button>
            <Button
              variant="outline"
              onClick={() => { setFiles([]); setRecords([]); }}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" /> Limpar tudo
            </Button>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <ProcessingProgress
            current={progress.current}
            total={progress.total}
            currentFileName={progress.fileName}
          />
        )}

        {/* Results */}
        {!isProcessing && records.length > 0 && (
          <>
            <DataTable records={records} />
            <div className="flex justify-end">
              <Button onClick={handleExport} className="gap-2 bg-success/90 hover:bg-success text-primary-foreground">
                <Download className="h-4 w-4" />
                Exportar para Excel
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
