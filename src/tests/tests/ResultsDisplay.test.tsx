import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { DocumentEntry, User } from '../../types';

// Mock ResultsDisplay component for testing
// Assume ResultsDisplay is exported from '../ResultsDisplay'
import ResultsDisplay from '../ResultsDisplay';

const mockUser: User = {
  id: 'u1',
  name: 'Alice',
  email: 'alice@example.com',
};

const mockDocuments: DocumentEntry[] = [
  {
    id: 'doc1',
    fileName: 'file1.pdf',
    uploadedAt: '2024-06-01T12:00:00Z',
    uploadedBy: mockUser,
    status: 'completed',
    extractedText: 'This is the extracted text.',
  },
  {
    id: 'doc2',
    fileName: 'file2.docx',
    uploadedAt: '2024-06-02T13:00:00Z',
    uploadedBy: mockUser,
    status: 'error',
    errorMessage: 'Failed to extract text.',
  },
  {
    id: 'doc3',
    fileName: 'file3.txt',
    uploadedAt: '2024-06-03T14:00:00Z',
    uploadedBy: mockUser,
    status: 'processing',
  },
];

describe('ResultsDisplay', () => {
  it('renders completed document with extracted text', () => {
    render(<ResultsDisplay documents={[mockDocuments[0]]} />);
    expect(screen.getByText('file1.pdf')).toBeInTheDocument();
    expect(screen.getByText('This is the extracted text.')).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  it('renders error document with error message', () => {
    render(<ResultsDisplay documents={[mockDocuments[1]]} />);
    expect(screen.getByText('file2.docx')).toBeInTheDocument();
    expect(screen.getByText('Failed to extract text.')).toBeInTheDocument();
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('renders processing document with status', () => {
    render(<ResultsDisplay documents={[mockDocuments[2]]} />);
    expect(screen.getByText('file3.txt')).toBeInTheDocument();
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
  });

  it('renders empty state when no documents', () => {
    render(<ResultsDisplay documents={[]} />);
    expect(screen.getByText(/no documents/i)).toBeInTheDocument();
  });
});