import { useState } from 'react';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ExtractedRecord } from '@/lib/ocrProcessor';

interface DataTableProps {
  records: ExtractedRecord[];
}

export function DataTable({ records }: DataTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!records.length) return null;

  const successCount = records.filter((r) => !r.hasError).length;
  const errorCount = records.filter((r) => r.hasError).length;
  const uniqueFiles = new Set(records.map(r => r.fileName)).size;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <h3 className="text-lg font-semibold text-foreground">Dados Extraídos</h3>
        <Badge variant="secondary" className="bg-success/15 text-success border-success/30">
          {successCount} registros encontrados
        </Badge>
        <Badge variant="secondary">
          {uniqueFiles} {uniqueFiles === 1 ? 'imagem' : 'imagens'}
        </Badge>
        {errorCount > 0 && (
          <Badge variant="secondary" className="bg-destructive/15 text-destructive border-destructive/30">
            {errorCount} sem dados
          </Badge>
        )}
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="text-muted-foreground font-semibold w-10">#</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Arquivo</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Linha</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Nome</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Telefone</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Data</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-center">Confiança</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-center w-12">Img</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r, idx) => (
              <TableRow
                key={r.id}
                className={r.hasError ? 'bg-destructive/5 hover:bg-destructive/10' : 'hover:bg-secondary/30'}
              >
                <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                <TableCell className="text-sm max-w-[120px] truncate">{r.fileName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.lineNumber || '—'}</TableCell>
                <TableCell className="font-medium">
                  {r.nome || (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" /> não encontrado
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {r.telefone || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-sm">
                  {r.data || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-center">
                  <span className={`text-sm font-medium ${r.confidence >= 70 ? 'text-success' : r.confidence >= 40 ? 'text-warning' : 'text-destructive'}`}>
                    {Math.round(r.confidence)}%
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  >
                    {expandedId === r.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  {expandedId === r.id && (
                    <div className="absolute z-10 mt-2 right-4 w-64 rounded-lg border border-border bg-card p-2 shadow-xl">
                      <img src={r.imageUrl} alt={r.fileName} className="w-full rounded" />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
