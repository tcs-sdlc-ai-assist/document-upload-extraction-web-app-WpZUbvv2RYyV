import React from 'react';
import { renderHook, act } from '@testing-library/react';
import type { DocumentEntry, User } from '../../types';
import { useDocumentManager } from '../../hooks/useDocumentManager';

// Mocks
const mockUser: User = {
  id: 'u1',
  name: 'testuser',
  email: 'test@example.com',
};

const mockFile = (name = 'test.pdf', type = 'application/pdf', size = 1024) =>
  new File(['dummy content'], name, { type });

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

jest.mock('../../services/FileValidator', () => ({
  validateFile: jest.fn((file: File | null) => {
    if (!file) return { valid: false, error: 'NO_FILE_SELECTED' };
    if (file.size > 10 * 1024 * 1024) return { valid: false, error: 'FILE_TOO_LARGE' };
    if (
      !(
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf') ||
        file.name.toLowerCase().endsWith('.docx') ||
        file.name.toLowerCase().endsWith('.txt')
      )
    ) {
      return { valid: false, error: 'UNSUPPORTED_FILE_TYPE' };
    }
    return { valid: true };
  }),
}));

jest.mock('../../services/TextExtractor', () => ({
  extractText: jest.fn(async (file: File) => {
    if (file.name === 'fail.pdf') throw new Error('EXTRACTION_FAILED');
    if (file.name === 'unsupported.xyz') throw new Error('UNSUPPORTED_FILE_TYPE');
    return `Extracted text from ${file.name}`;
  }),
}));

jest.mock('../../utils/textCleaner', () => ({
  cleanExtractedText: jest.fn((text: string) => text.replace(/dummy/g, 'cleaned')),
}));

jest.mock('../../services/StorageAdapter', () => {
  let docs: Record<string, DocumentEntry[]> = {};
  return {
    loadDocuments: jest.fn((username: string) => docs[username] || []),
    saveDocuments: jest.fn((username: string, entries: DocumentEntry[]) => {
      docs[username] = entries;
    }),
    addDocument: jest.fn((username: string, entry: DocumentEntry) => {
      docs[username] = [entry, ...(docs[username] || [])];
    }),
    updateDocument: jest.fn((username: string, id: string, update: Partial<DocumentEntry>) => {
      docs[username] = (docs[username] || []).map((d) =>
        d.id === id ? { ...d, ...update } : d
      );
    }),
    removeDocument: jest.fn((username: string, id: string) => {
      docs[username] = (docs[username] || []).filter((d) => d.id !== id);
    }),
    clearDocuments: jest.fn((username: string) => {
      docs[username] = [];
    }),
  };
});

jest.mock('../../utils/uuid', () => ({
  generateUUID: jest.fn(() => 'uuid-1234'),
}));

describe('useDocumentManager', () => {
  beforeEach(() => {
    // Reset storage mock
    const { clearDocuments } = require('../../services/StorageAdapter');
    clearDocuments(mockUser.name);
    jest.clearAllMocks();
  });

  it('loads documents for the current user (happy path)', () => {
    const { result } = renderHook(() => useDocumentManager());
    expect(result.current.documents).toEqual([]);
  });

  it('uploads a valid file and processes extraction (happy path)', async () => {
    const { result } = renderHook(() => useDocumentManager());
    await act(async () => {
      await result.current.uploadDocument(mockFile('test.pdf', 'application/pdf', 1024));
    });
    expect(result.current.status).toBe('success');
    expect(result.current.documents[0].fileName).toBe('test.pdf');
    expect(result.current.documents[0].status).toBe('completed');
    expect(result.current.documents[0].extractedText).toMatch(/Extracted text/);
  });

  it('rejects upload if file is too large', async () => {
    const { result } = renderHook(() => useDocumentManager());
    await act(async () => {
      await result.current.uploadDocument(mockFile('big.pdf', 'application/pdf', 11 * 1024 * 1024));
    });
    expect(result.current.status).toBe('error');
    expect(result.current.error?.code).toBe('FILE_TOO_LARGE');
  });

  it('rejects upload if file type is unsupported', async () => {
    const { result } = renderHook(() => useDocumentManager());
    await act(async () => {
      await result.current.uploadDocument(mockFile('unsupported.xyz', 'application/xyz', 1000));
    });
    expect(result.current.status).toBe('error');
    expect(result.current.error?.code).toBe('UNSUPPORTED_FILE_TYPE');
  });

  it('handles extraction failure', async () => {
    const { result } = renderHook(() => useDocumentManager());
    await act(async () => {
      await result.current.uploadDocument(mockFile('fail.pdf', 'application/pdf', 1024));
    });
    expect(result.current.status).toBe('error');
    expect(result.current.error?.code).toBe('EXTRACTION_FAILED');
    expect(result.current.documents[0].status).toBe('error');
    expect(result.current.documents[0].errorMessage).toMatch(/Failed to extract/);
  });

  it('deleteDocument removes a document', async () => {
    const { result } = renderHook(() => useDocumentManager());
    await act(async () => {
      await result.current.uploadDocument(mockFile('test.pdf', 'application/pdf', 1024));
    });
    expect(result.current.documents.length).toBe(1);
    act(() => {
      result.current.deleteDocument('uuid-1234');
    });
    expect(result.current.documents.length).toBe(0);
  });

  it('clearAllDocuments removes all documents', async () => {
    const { result } = renderHook(() => useDocumentManager());
    await act(async () => {
      await result.current.uploadDocument(mockFile('test.pdf', 'application/pdf', 1024));
      await result.current.uploadDocument(mockFile('test2.pdf', 'application/pdf', 1024));
    });
    expect(result.current.documents.length).toBe(2);
    act(() => {
      result.current.clearAllDocuments();
    });
    expect(result.current.documents.length).toBe(0);
  });

  it('retryExtraction returns error if original file is not available', async () => {
    const { result } = renderHook(() => useDocumentManager());
    await act(async () => {
      await result.current.uploadDocument(mockFile('fail.pdf', 'application/pdf', 1024));
    });
    await act(async () => {
      await result.current.retryExtraction('uuid-1234');
    });
    expect(result.current.status).toBe('error');
    expect(result.current.error?.code).toBe('EXTRACTION_FAILED');
    expect(result.current.error?.message).toMatch(/Original file is not available/);
  });

  it('refresh reloads documents', async () => {
    const { result } = renderHook(() => useDocumentManager());
    await act(async () => {
      await result.current.uploadDocument(mockFile('test.pdf', 'application/pdf', 1024));
    });
    act(() => {
      result.current.refresh();
    });
    expect(result.current.documents.length).toBe(1);
  });
});