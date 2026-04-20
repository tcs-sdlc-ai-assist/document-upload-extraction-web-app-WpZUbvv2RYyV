import { extractText } from '../../services/TextExtractor';

describe('TextExtractor', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('TXT extraction', () => {
    it('extracts text from a plain text file (happy path)', async () => {
      const content = 'Hello, world!\nThis is a test file.';
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      const result = await extractText(file);
      expect(result).toBe(content);
    });

    it('throws EXTRACTION_FAILED for empty txt file', async () => {
      const file = new File([''], 'empty.txt', { type: 'text/plain' });
      await expect(extractText(file)).rejects.toThrow('EXTRACTION_FAILED');
    });
  });

  describe('DOCX extraction', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('extracts text from a docx file using mammoth (happy path)', async () => {
      const fakeText = 'Extracted DOCX text';
      jest.mock('mammoth', () => ({
        __esModule: true,
        default: {
          extractRawText: jest.fn().mockResolvedValue({ value: fakeText }),
        },
        extractRawText: jest.fn().mockResolvedValue({ value: fakeText }),
      }));
      const { extractText: extractTextReloaded } = await import('../../services/TextExtractor');
      const file = new File(['docx-content'], 'file.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const result = await extractTextReloaded(file);
      expect(result).toBe(fakeText);
    });

    it('throws EXTRACTION_FAILED for empty docx extraction', async () => {
      jest.mock('mammoth', () => ({
        __esModule: true,
        default: {
          extractRawText: jest.fn().mockResolvedValue({ value: '' }),
        },
        extractRawText: jest.fn().mockResolvedValue({ value: '' }),
      }));
      const { extractText: extractTextReloaded } = await import('../../services/TextExtractor');
      const file = new File(['docx-content'], 'file.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      await expect(extractTextReloaded(file)).rejects.toThrow('EXTRACTION_FAILED');
    });
  });

  describe('PDF extraction', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('extracts text from a pdf file using pdfjs-dist (happy path)', async () => {
      const fakeText = 'PDF page 1 text\nPDF page 2 text\n';
      const getTextContent = jest.fn()
        .mockResolvedValueOnce({
          items: [{ str: 'PDF page 1 text' }],
        })
        .mockResolvedValueOnce({
          items: [{ str: 'PDF page 2 text' }],
        });
      const getPage = jest.fn()
        .mockImplementation((pageNum: number) => ({
          getTextContent: () => getTextContent(),
        }));
      const pdfMock = {
        numPages: 2,
        getPage,
      };
      jest.mock('pdfjs-dist/build/pdf', () => ({
        __esModule: true,
        default: {},
        GlobalWorkerOptions: { workerSrc: '' },
        getDocument: jest.fn().mockReturnValue({
          promise: Promise.resolve(pdfMock),
        }),
      }));
      const { extractText: extractTextReloaded } = await import('../../services/TextExtractor');
      const file = new File(['pdf-content'], 'file.pdf', { type: 'application/pdf' });
      const result = await extractTextReloaded(file);
      expect(result).toContain('PDF page 1 text');
      expect(result).toContain('PDF page 2 text');
    });

    it('throws EXTRACTION_FAILED for empty pdf extraction', async () => {
      const getTextContent = jest.fn().mockResolvedValue({ items: [] });
      const getPage = jest.fn().mockImplementation(() => ({
        getTextContent,
      }));
      const pdfMock = {
        numPages: 1,
        getPage,
      };
      jest.mock('pdfjs-dist/build/pdf', () => ({
        __esModule: true,
        default: {},
        GlobalWorkerOptions: { workerSrc: '' },
        getDocument: jest.fn().mockReturnValue({
          promise: Promise.resolve(pdfMock),
        }),
      }));
      const { extractText: extractTextReloaded } = await import('../../services/TextExtractor');
      const file = new File(['pdf-content'], 'file.pdf', { type: 'application/pdf' });
      await expect(extractTextReloaded(file)).rejects.toThrow('EXTRACTION_FAILED');
    });
  });

  describe('Unsupported file type', () => {
    it('throws UNSUPPORTED_FILE_TYPE for unknown file type', async () => {
      const file = new File(['data'], 'file.xyz', { type: 'application/xyz' });
      await expect(extractText(file)).rejects.toThrow('UNSUPPORTED_FILE_TYPE');
    });
  });
});