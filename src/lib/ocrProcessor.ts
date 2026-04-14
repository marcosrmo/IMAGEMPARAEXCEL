import { createWorker, Worker } from 'tesseract.js';

export interface ExtractedRecord {
  id: string;
  fileName: string;
  imageUrl: string;
  nome: string;
  telefone: string;
  data: string;
  rawText: string;
  confidence: number;
  hasError: boolean;
  lineNumber: number;
}

function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      const scale = Math.max(1, 2000 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;

      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        const contrast = 1.8;
        const adjusted = ((gray / 255 - 0.5) * contrast + 0.5) * 255;
        const val = Math.max(0, Math.min(255, adjusted));
        d[i] = d[i + 1] = d[i + 2] = val;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.src = URL.createObjectURL(file);
  });
}

interface ParsedLine {
  nome: string;
  telefone: string;
  data: string;
  rawLine: string;
}

/**
 * Normaliza texto OCR: corrige espaços extras, caracteres comuns mal lidos
 */
function normalizeOcrText(text: string): string {
  return text
    .replace(/\|/g, 'l')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/\s{2,}/g, ' ');
}

/**
 * Extrai telefone de uma string.
 * Aceita formatos como:
 *   (11) 99999-9999, (11)99999-9999, 11 99999-9999, 11999999999,
 *   +55 11 99999-9999, 55 11 999999999, 9999-9999, 99999-9999
 *   e sequências de 10-13 dígitos
 */
function extractPhone(text: string): string {
  // Formato com parênteses: (DD) NNNNN-NNNN
  const withParens = text.match(/\(?\d{2}\)?\s*\d{4,5}[-.\s]?\d{4}/g);
  if (withParens) {
    // Retorna o que tiver mais dígitos (mais completo)
    const best = withParens.sort((a, b) => b.replace(/\D/g, '').length - a.replace(/\D/g, '').length)[0];
    const digits = best.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 13) return best.trim();
  }

  // Sequência de 10-13 dígitos (telefone puro)
  const rawDigits = text.match(/\b\d{10,13}\b/g);
  if (rawDigits) {
    return rawDigits[0];
  }

  // Formato com +55
  const intl = text.match(/\+?\d{2}\s*\(?\d{2}\)?\s*\d{4,5}[-.\s]?\d{4}/g);
  if (intl) {
    return intl[0].trim();
  }

  return '';
}

/**
 * Extrai nome (sequência de palavras em maiúsculas, mín 2 palavras, mín 5 chars)
 */
function extractName(text: string): string {
  const matches = text.match(/([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]{2,}(?:\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]{2,})+)/g);
  if (!matches) return '';
  const filtered = matches
    .map(m => m.trim())
    .filter(m => m.length >= 5)
    .sort((a, b) => b.length - a.length);
  return filtered[0] || '';
}

function extractAllRecords(text: string): ParsedLine[] {
  const normalized = normalizeOcrText(text);
  const lines = normalized.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const records: ParsedLine[] = [];

  const dataRegex = /\b(\d{2}\/\d{2}\/\d{4})\b/g;

  for (const line of lines) {
    const nome = extractName(line);
    const telefone = extractPhone(line);
    const dataMatch = line.match(dataRegex);
    const data = dataMatch ? dataMatch[0] : '';

    if (nome || telefone) {
      records.push({ nome, telefone, data, rawLine: line });
    }
  }

  // Se linha-a-linha não encontrou nada, tente agrupar nome+telefone por proximidade
  if (records.length === 0) {
    const allNomes: { value: string; index: number }[] = [];
    const allPhones: { value: string; index: number }[] = [];

    const nomeRegex = /([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]{2,}(?:\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]{2,})+)/g;
    let match: RegExpExecArray | null;

    while ((match = nomeRegex.exec(normalized)) !== null) {
      if (match[1].trim().length >= 5) {
        allNomes.push({ value: match[1].trim(), index: match.index });
      }
    }

    // Busca telefones no texto todo
    const phonePatterns = [
      /\(?\d{2}\)?\s*\d{4,5}[-.\s]?\d{4}/g,
      /\b\d{10,13}\b/g,
    ];
    for (const pattern of phonePatterns) {
      while ((match = pattern.exec(normalized)) !== null) {
        const digits = match[0].replace(/\D/g, '');
        if (digits.length >= 10 && digits.length <= 13) {
          allPhones.push({ value: match[0].trim(), index: match.index });
        }
      }
    }

    for (const n of allNomes) {
      const closestPhone = allPhones
        .filter(p => p.index > n.index)
        .sort((a, b) => a.index - b.index)[0];
      const closestData = normalized.slice(n.index).match(/\b(\d{2}\/\d{2}\/\d{4})\b/);

      records.push({
        nome: n.value,
        telefone: closestPhone?.value || '',
        data: closestData ? closestData[1] : '',
        rawLine: '',
      });
    }
  }

  // Deduplica por nome+telefone
  const seen = new Set<string>();
  return records.filter(r => {
    const key = `${r.nome}|${r.telefone}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export type ProgressCallback = (current: number, total: number, fileName: string) => void;

let workerInstance: Worker | null = null;

async function getWorker(): Promise<Worker> {
  if (!workerInstance) {
    workerInstance = await createWorker('por');
  }
  return workerInstance;
}

export async function processImages(
  files: File[],
  onProgress: ProgressCallback
): Promise<ExtractedRecord[]> {
  const records: ExtractedRecord[] = [];
  const worker = await getWorker();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress(i, files.length, file.name);

    try {
      const processedDataUrl = await preprocessImage(file);
      const { data } = await worker.recognize(processedDataUrl);
      const parsedRecords = extractAllRecords(data.text);
      const imageUrl = URL.createObjectURL(file);

      if (parsedRecords.length === 0) {
        records.push({
          id: `${Date.now()}-${i}-0`,
          fileName: file.name,
          imageUrl,
          nome: '',
          telefone: '',
          data: '',
          rawText: data.text,
          confidence: data.confidence,
          hasError: true,
          lineNumber: 0,
        });
      } else {
        parsedRecords.forEach((rec, j) => {
          records.push({
            id: `${Date.now()}-${i}-${j}`,
            fileName: file.name,
            imageUrl,
            nome: rec.nome,
            telefone: rec.telefone,
            data: rec.data,
            rawText: rec.rawLine || data.text,
            confidence: data.confidence,
            hasError: !rec.nome && !rec.telefone,
            lineNumber: j + 1,
          });
        });
      }
    } catch (err) {
      console.error(`Erro ao processar ${file.name}:`, err);
      records.push({
        id: `${Date.now()}-${i}-0`,
        fileName: file.name,
        imageUrl: URL.createObjectURL(file),
        nome: '',
        telefone: '',
        data: '',
        rawText: `Erro: ${err instanceof Error ? err.message : 'Falha no OCR'}`,
        confidence: 0,
        hasError: true,
        lineNumber: 0,
      });
    }
  }

  onProgress(files.length, files.length, '');
  return records;
}

export function terminateWorker() {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
}
