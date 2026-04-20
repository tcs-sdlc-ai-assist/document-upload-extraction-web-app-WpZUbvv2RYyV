import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import type { DocumentEntry, User } from '../../types';
import DocumentHistory from '../DocumentHistory';

const mockUser: User = {
  id: 'user1',
  name: 'Alice Smith',
  email: 'alice@example.com',
  avatarUrl: 'https://example.com/avatar.png',
};

const mockDocuments: DocumentEntry[] = [
  {
    id: 'doc1',
    fileName: 'invoice.pdf',
    uploadedAt: '2024-06-01T10:00:00.000Z',
    uploadedBy: mockUser,
    status: 'completed',
    extractedText: 'Invoice details...',
  },
  {
    id: 'doc2',
    fileName: 'contract.docx',
    uploadedAt: '2024-06-02T12:30:00.000Z',
    uploadedBy: mockUser,
    status: 'error',
    errorMessage: 'Failed to extract text',
  },
];

jest.mock('../useDocumentHistory', () => ({
  __esModule: true,
  default: () => ({
    documents: mockDocuments,
    loading: false,
    error: null,
    refresh: jest.fn(),
  }),
}));

describe('DocumentHistory', () => {
  it('renders a list of uploaded documents with status', async () => {
    render(<DocumentHistory />);
    expect(screen.getByText('Document History')).toBeInTheDocument();
    expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
    expect(screen.getByText('contract.docx')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('shows loading indicator when loading', async () => {
    jest.resetModules();
    jest.doMock('../useDocumentHistory', () => ({
      __esModule: true,
      default: () => ({
        documents: [],
        loading: true,
        error: null,
        refresh: jest.fn(),
      }),
    }));
    const DocumentHistoryReloaded = (await import('../DocumentHistory')).default;
    render(<DocumentHistoryReloaded />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows error message when error occurs', async () => {
    jest.resetModules();
    jest.doMock('../useDocumentHistory', () => ({
      __esModule: true,
      default: () => ({
        documents: [],
        loading: false,
        error: 'Failed to load documents',
        refresh: jest.fn(),
      }),
    }));
    const DocumentHistoryReloaded = (await import('../DocumentHistory')).default;
    render(<DocumentHistoryReloaded />);
    expect(screen.getByText(/failed to load documents/i)).toBeInTheDocument();
  });

  it('shows message when there are no documents', async () => {
    jest.resetModules();
    jest.doMock('../useDocumentHistory', () => ({
      __esModule: true,
      default: () => ({
        documents: [],
        loading: false,
        error: null,
        refresh: jest.fn(),
      }),
    }));
    const DocumentHistoryReloaded = (await import('../DocumentHistory')).default;
    render(<DocumentHistoryReloaded />);
    expect(screen.getByText(/no documents uploaded/i)).toBeInTheDocument();
  });
});