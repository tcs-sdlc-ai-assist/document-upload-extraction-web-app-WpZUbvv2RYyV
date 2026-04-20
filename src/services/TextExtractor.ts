import type { File as FileType } from '../types';

/**
 * Extracts text from a PDF, DOCX, or TXT file.
 * Uses pdfjs-dist for PDF, mammoth for DOCX, FileReader for TXT.
 * @param file File to extract text from
 * @returns Promise<string> Extracted text
 * @throws Error if extraction fails or file type is unsupported
 */
export async function extractText(file: File): Promise<string> {
  const mime = file.type;
  if (mime === 'application/pdf') {
    return extractPdfText(file);
  }
  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.toLowerCase().endsWith('.docx')
  ) {
    return extractDocxText(file);
  }
  if (mime === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
    return extractTxtText(file);
  }
  throw new Error('UNSUPPORTED_FILE_TYPE');
}

async function extractPdfText(file: File): Promise<string> {
  // Lazy-load pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist/build/pdf');
  // @ts-expect-error pdfjsLib.GlobalWorkerOptions exists
  pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ') + '\n';
  }
  if (!text.trim()) throw new Error('EXTRACTION_FAILED');
  return text;
}

async function extractDocxText(file: File): Promise<string> {
  // Lazy-load mammoth
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const { value: text } = await mammoth.extractRawText({ arrayBuffer });
  if (!text.trim()) throw new Error('EXTRACTION_FAILED');
  return text;
}

function extractTxtText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result.trim()) {
        reject(new Error('EXTRACTION_FAILED'));
      } else {
        resolve(result);
      }
    };
    reader.onerror = () => reject(new Error('EXTRACTION_FAILED'));
    reader.readAsText(file);
  });
}