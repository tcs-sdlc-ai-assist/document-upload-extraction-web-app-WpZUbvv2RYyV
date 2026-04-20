import { validateFile, type ValidationResult, type ValidationError } from '../../services/FileValidator';

describe('FileValidator', () => {
  const makeFile = (name: string, type: string, size: number): File => {
    // @ts-expect-error: File constructor is available in browser/test env
    return new File(['a'.repeat(size)], name, { type });
  };

  it('accepts a valid PDF file (happy path)', () => {
    const file = makeFile('test.pdf', 'application/pdf', 1024 * 1024);
    const result = validateFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts a valid DOCX file by MIME', () => {
    const file = makeFile(
      'doc.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      1024 * 512
    );
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('accepts a valid DOCX file by extension', () => {
    const file = makeFile('doc.docx', 'application/octet-stream', 1000);
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('accepts a valid TXT file by MIME', () => {
    const file = makeFile('notes.txt', 'text/plain', 100);
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('accepts a valid TXT file by extension', () => {
    const file = makeFile('notes.txt', 'application/octet-stream', 100);
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('rejects unsupported file type (e.g., PNG)', () => {
    const file = makeFile('image.png', 'image/png', 1000);
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('UNSUPPORTED_FILE_TYPE');
  });

  it('rejects unsupported file type by extension', () => {
    const file = makeFile('file.xyz', 'application/xyz', 1000);
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('UNSUPPORTED_FILE_TYPE');
  });

  it('rejects file that is too large', () => {
    const file = makeFile('big.pdf', 'application/pdf', 11 * 1024 * 1024); // 11MB
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('FILE_TOO_LARGE');
  });

  it('rejects null file (no file selected)', () => {
    const result = validateFile(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('NO_FILE_SELECTED');
  });

  it('accepts file exactly at max size', () => {
    const file = makeFile('max.pdf', 'application/pdf', 10 * 1024 * 1024); // 10MB
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('accepts file with uppercase extension', () => {
    const file = makeFile('UPPERCASE.DOCX', 'application/octet-stream', 1000);
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('rejects file with no extension and unknown MIME', () => {
    const file = makeFile('noext', 'application/octet-stream', 1000);
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('UNSUPPORTED_FILE_TYPE');
  });
});