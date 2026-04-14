import * as XLSX from 'xlsx';
import type { ExtractedRecord } from './ocrProcessor';
import { getAllColumns } from './ocrProcessor';

export function exportToExcel(records: ExtractedRecord[]) {
  const validRecords = records.filter(r => !r.hasError);
  const columns = getAllColumns(validRecords);

  const data = validRecords.map((r, i) => {
    const row: Record<string, string | number> = {
      '#': i + 1,
      Arquivo: r.fileName,
    };

    for (const col of columns) {
      row[col] = r.fields[col] || '—';
    }

    row['Confiança OCR'] = `${Math.round(r.confidence)}%`;

    return row;
  });

  const ws = XLSX.utils.json_to_sheet(data);

  // Ajusta largura das colunas automaticamente
  const colWidths: { wch: number }[] = [
    { wch: 5 },   // #
    { wch: 25 },  // Arquivo
    ...columns.map(() => ({ wch: 20 })),
    { wch: 13 },  // Confiança OCR
  ];
  ws['!cols'] = colWidths;

  // Estilo do cabeçalho (negrito)
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[cellRef]) continue;
    ws[cellRef].s = { font: { bold: true } };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados Extraídos');
  XLSX.writeFile(wb, 'leadcompra_dados.xlsx');
}
