import * as XLSX from 'xlsx';
import type { ExtractedRecord } from './ocrProcessor';

export function exportToExcel(records: ExtractedRecord[]) {
  const data = records.map((r, i) => ({
    '#': i + 1,
    Nome: r.nome || '—',
    Telefone: r.telefone || '—',
    Data: r.data || '—',
    Arquivo: r.fileName,
    Linha: r.lineNumber || '—',
    Confiança: `${Math.round(r.confidence)}%`,
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  ws['!cols'] = [
    { wch: 5 },
    { wch: 35 },
    { wch: 20 },
    { wch: 14 },
    { wch: 25 },
    { wch: 8 },
    { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados Extraídos');
  XLSX.writeFile(wb, 'leadcompra_dados.xlsx');
}
