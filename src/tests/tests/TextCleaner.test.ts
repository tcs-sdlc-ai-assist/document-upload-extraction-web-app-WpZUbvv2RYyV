import { cleanExtractedText, type TextCleanerOptions } from '../../utils/textCleaner';

describe('cleanExtractedText', () => {
  it('removes non-printable/control characters except \\n, \\r, \\t', () => {
    const raw = 'Hello\u0000World\nTab\tEnd\u0007';
    const cleaned = cleanExtractedText(raw);
    expect(cleaned).toBe('HelloWorld\nTab End');
  });

  it('collapses multiple spaces and tabs into a single space', () => {
    const raw = 'This    is\t\ta   test.\nAnother\t\tline.';
    const cleaned = cleanExtractedText(raw);
    expect(cleaned).toBe('This is a test.\nAnother line.');
  });

  it('trims leading/trailing whitespace on each line and removes empty lines', () => {
    const raw = '   Line one   \n\n\tLine two\t\n   \nLine three   ';
    const cleaned = cleanExtractedText(raw);
    expect(cleaned).toBe('Line one\nLine two\nLine three');
  });

  it('normalizes line endings to \\n', () => {
    const raw = 'Line1\r\nLine2\rLine3\nLine4';
    const cleaned = cleanExtractedText(raw);
    expect(cleaned).toBe('Line1\nLine2\nLine3\nLine4');
  });

  it('optionally lowercases the text if toLowerCase is true', () => {
    const raw = 'HeLLo WoRLd\nSecond LINE';
    const cleaned = cleanExtractedText(raw, { toLowerCase: true });
    expect(cleaned).toBe('hello world\nsecond line');
  });

  it('returns empty string for input with only whitespace and control chars', () => {
    const raw = '  \n\t\r  \u0000\u0007\n';
    const cleaned = cleanExtractedText(raw);
    expect(cleaned).toBe('');
  });

  it('handles already clean text (idempotent)', () => {
    const raw = 'Already clean\nText here';
    const cleaned = cleanExtractedText(raw);
    expect(cleaned).toBe('Already clean\nText here');
  });

  it('does not lowercase by default', () => {
    const raw = 'ABC def';
    const cleaned = cleanExtractedText(raw);
    expect(cleaned).toBe('ABC def');
  });

  it('handles text with only one line', () => {
    const raw = '   Single line with   spaces   ';
    const cleaned = cleanExtractedText(raw);
    expect(cleaned).toBe('Single line with spaces');
  });
});