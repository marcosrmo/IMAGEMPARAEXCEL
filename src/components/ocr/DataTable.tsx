import { useState } from 'react';
import { AlertTriangle, Eye, EyeOff, CheckCircle2, XCircle, BarChart3 } from 'lucide-react';
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
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Dados Extraídos</h3>
        </div>

        <div className="flex gap-2 flex-wrap ml-1">
          <Badge className="gap-1.5 bg-primary/15 text-primary border border-primary/25 hover:bg-primary/20 px-3 py-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {successCount} registros
          </Badge>
          <Badge variant="secondary" className="gap-1.5 border border-border/60 px-3 py-1">
            {uniqueFiles} {uniqueFiles === 1 ? 'imagem' : 'imagens'}
          </Badge>
          {errorCount > 0 && (
            <Badge className="gap-1.5 bg-destructive/10 text-destructive border border-destructive/25 hover:bg-destructive/15 px-3 py-1">
              <XCircle className="h-3.5 w-3.5" />
              {errorCount} sem dados
            </Badge>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/60 overflow-hidden shadow-sm bg-card/50">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60 border-b border-border/60">
              <TableHead className="text-muted-foreground font-semibold w-10 text-center">#</TableHead>
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
                className={`border-b border-border/30 transition-colors duration-150 ${
                  r.hasError
                    ? 'bg-destructive/4 hover:bg-destructive/8'
                    : 'hover:bg-primary/4'
                }`}
              >
                <TableCell className="text-xs text-muted-foreground text-center font-mono">{idx + 1}</TableCell>
                <TableCell className="text-sm max-w-[120px] truncate text-muted-foreground">{r.fileName}</TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">{r.lineNumber || '—'}</TableCell>
                <TableCell className="font-semibold text-foreground/90">
                  {r.nome || (
                    <span className="flex items-center gap-1.5 text-muted-foreground font-normal">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                      não encontrado
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm text-foreground/80">
                  {r.telefone || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-sm text-foreground/80">
                  {r.data || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-center">
                  <span className={`
                    inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold min-w-[3rem]
                    ${r.confidence >= 70
                      ? 'bg-primary/15 text-primary border border-primary/25'
                      : r.confidence >= 40
                        ? 'bg-warning/15 text-warning border border-warning/25'
                        : 'bg-destructive/15 text-destructive border border-destructive/25'
                    }
                  `}>
                    {Math.round(r.confidence)}%
                  </span>
                </TableCell>
                <TableCell className="text-center relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  >
                    {expandedId === r.id
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />
                    }
                  </Button>
                  {expandedId === r.id && (
                    <div className="absolute z-20 mt-2 right-4 w-72 rounded-xl border border-border/60 bg-card p-3 shadow-2xl">
                      <img src={r.imageUrl} alt={r.fileName} className="w-full rounded-lg" />
                      <p className="mt-2 text-xs text-muted-foreground truncate text-center">{r.fileName}</p>
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
