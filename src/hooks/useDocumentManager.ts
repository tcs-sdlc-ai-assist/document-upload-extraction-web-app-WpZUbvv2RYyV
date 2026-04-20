import { useState, useEffect, useCallback } from 'react';
import type { DocumentEntry, User } from '../types';
import { validateFile, type ValidationResult, type ValidationError } from '../services/FileValidator';
import { extractText } from '../services/TextExtractor';
import { cleanExtractedText } from '../utils/textCleaner';
import {
  loadDocuments,
  saveDocuments,
  addDocument,
  updateDocument,
  removeDocument,
  clearDocuments,
} from '../services/StorageAdapter';
import { useAuth } from '../context/AuthContext';
import { generateUUID } from '../utils/uuid';

type UploadStatus = 'idle' | 'validating' | 'extracting' | 'saving' | 'success' | 'error';
type UploadError =
  | null
  | {
      code: ValidationError | 'EXTRACTION_FAILED' | 'STORAGE_ERROR' | 'NO_USER';
      message: string;
    };

interface UseDocumentManagerResult {
  documents: DocumentEntry[];
  uploadDocument: (file: File) => Promise<void>;
  retryExtraction: (id: string) => Promise<void>;
  deleteDocument: (id: string) => void;
  clearAllDocuments: () => void;
  status: UploadStatus;
  error: UploadError;
  refresh: () => void;
}

/**
 * useDocumentManager
 * Main hook for document upload, extraction, cleaning, storage, and retrieval.
 */
export function useDocumentManager(): UseDocumentManagerResult {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<UploadError>(null);

  // Load documents for current user
  const loadUserDocuments = useCallback(() => {
    if (!user) {
      setDocuments([]);
      return;
    }
    const docs = loadDocuments(user.name);
    setDocuments(docs);
  }, [user]);

  useEffect(() => {
    loadUserDocuments();
  }, [loadUserDocuments]);

  // Upload and process a document
  const uploadDocument = useCallback(
    async (file: File) => {
      setError(null);
      setStatus('validating');
      if (!user) {
        setStatus('error');
        setError({
          code: 'NO_USER',
          message: 'You must be logged in to upload documents.',
        });
        return;
      }
      // Validate file
      const validation: ValidationResult = validateFile(file);
      if (!validation.valid) {
        setStatus('error');
        setError({
          code: validation.error!,
          message:
            validation.error === 'UNSUPPORTED_FILE_TYPE'
              ? 'Only PDF, DOCX, and TXT files are supported.'
              : validation.error === 'FILE_TOO_LARGE'
              ? 'File is too large.'
              : 'No file selected.',
        });
        return;
      }

      // Prepare metadata
      const id = generateUUID();
      const now = new Date().toISOString();
      const entry: DocumentEntry = {
        id,
        fileName: file.name,
        uploadedAt: now,
        uploadedBy: user,
        status: 'processing',
      };

      // Add as "processing"
      try {
        addDocument(user.name, entry);
        setDocuments(loadDocuments(user.name));
      } catch {
        setStatus('error');
        setError({
          code: 'STORAGE_ERROR',
          message: 'Failed to save document metadata.',
        });
        return;
      }

      setStatus('extracting');
      // Extract and clean text
      let extractedText = '';
      try {
        extractedText = await extractText(file);
        extractedText = cleanExtractedText(extractedText);
        setStatus('saving');
        updateDocument(user.name, id, {
          status: 'completed',
          extractedText,
        });
        setDocuments(loadDocuments(user.name));
        setStatus('success');
      } catch (e: any) {
        updateDocument(user.name, id, {
          status: 'error',
          errorMessage:
            e?.message === 'UNSUPPORTED_FILE_TYPE'
              ? 'Only PDF, DOCX, and TXT files are supported.'
              : e?.message === 'EXTRACTION_FAILED'
              ? 'Failed to extract text from the document.'
              : 'Extraction failed.',
        });
        setDocuments(loadDocuments(user.name));
        setStatus('error');
        setError({
          code:
            e?.message === 'UNSUPPORTED_FILE_TYPE'
              ? 'UNSUPPORTED_FILE_TYPE'
              : 'EXTRACTION_FAILED',
          message:
            e?.message === 'UNSUPPORTED_FILE_TYPE'
              ? 'Only PDF, DOCX, and TXT files are supported.'
              : 'Failed to extract text from the document.',
        });
      }
    },
    [user]
  );

  // Retry extraction for a failed document
  const retryExtraction = useCallback(
    async (id: string) => {
      setError(null);
      setStatus('extracting');
      if (!user) {
        setStatus('error');
        setError({
          code: 'NO_USER',
          message: 'You must be logged in to retry extraction.',
        });
        return;
      }
      const docs = loadDocuments(user.name);
      const entry = docs.find((d) => d.id === id);
      if (!entry) {
        setStatus('error');
        setError({
          code: 'STORAGE_ERROR',
          message: 'Document not found.',
        });
        return;
      }
      // We don't have the original file, so cannot retry extraction
      setStatus('error');
      setError({
        code: 'EXTRACTION_FAILED',
        message:
          'Original file is not available for retry. Please re-upload the document.',
      });
    },
    [user]
  );

  // Delete a document
  const deleteDocument = useCallback(
    (id: string) => {
      if (!user) return;
      removeDocument(user.name, id);
      setDocuments(loadDocuments(user.name));
    },
    [user]
  );

  // Clear all documents for the user
  const clearAllDocuments = useCallback(() => {
    if (!user) return;
    clearDocuments(user.name);
    setDocuments([]);
  }, [user]);

  // Manual refresh
  const refresh = useCallback(() => {
    loadUserDocuments();
  }, [loadUserDocuments]);

  return {
    documents,
    uploadDocument,
    retryExtraction,
    deleteDocument,
    clearAllDocuments,
    status,
    error,
    refresh,
  };
}

export type { UploadStatus, UploadError };