import React, { useRef } from 'react';
import type { DocumentEntry } from '../../types';
import { useDocumentManager } from '../../hooks/useDocumentManager';
import AccessibleButton from './AccessibleButton';
import ProgressIndicator from './ProgressIndicator';
import StatusMessage from './StatusMessage';

interface DocumentUploadProps {}

const DocumentUpload: React.FC<DocumentUploadProps> = () => {
  const {
    uploadDocument,
    documents,
    status,
    error,
  } = useDocumentManager();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFile(e.target.files[0]);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  const handleFile = async (file: File) => {
    await uploadDocument(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // UI status
  const uploading = status === 'validating' || status === 'extracting' || status === 'saving';

  return (
    <div className="w-full max-w-xl mx-auto mt-8">
      <div
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg px-8 py-12 transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-blue-400'
        }`}
        tabIndex={0}
        aria-label="File upload dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        role="button"
        style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
        aria-disabled={uploading}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={uploading}
          tabIndex={-1}
        />
        <svg
          className="w-12 h-12 text-blue-400 mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 32v6a2 2 0 002 2h16a2 2 0 002-2v-6m-8-16v16m0 0l-6-6m6 6l6-6"
          />
        </svg>
        <span className="text-lg font-medium text-gray-700 mb-1">
          Drag &amp; drop a PDF, DOCX, or TXT file here
        </span>
        <span className="text-sm text-gray-500 mb-3">
          or{' '}
          <button
            type="button"
            className="text-blue-600 underline font-medium focus:outline-none"
            onClick={e => {
              e.stopPropagation();
              handleBrowseClick();
            }}
            disabled={uploading}
            tabIndex={-1}
          >
            browse your device
          </button>
        </span>
        <span className="text-xs text-gray-400">
          Max file size: 10MB. Only PDF, DOCX, or TXT.
        </span>
      </div>

      {uploading && (
        <div className="mt-6">
          <ProgressIndicator value={status === 'saving' ? 100 : 60} indeterminate={status !== 'saving'} label="Processing..." />
        </div>
      )}

      {status === 'success' && (
        <StatusMessage status="success" message="Document uploaded and processed successfully." />
      )}
      {status === 'error' && error && (
        <StatusMessage status="error" message={error.message} />
      )}

      <ResultsDisplay entries={documents} />
    </div>
  );
};

interface ResultsDisplayProps {
  entries: DocumentEntry[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ entries }) => {
  if (!entries.length) {
    return (
      <div className="text-gray-400 text-center mt-10">No documents uploaded yet.</div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold mb-4">Your Uploaded Documents</h2>
      <div className="space-y-4">
        {entries.map(entry => (
          <div key={entry.id} className="p-4 rounded shadow bg-white border">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{entry.fileName}</span>
                <span className="ml-2 text-xs text-gray-400">
                  ({new Date(entry.uploadedAt).toLocaleString()})
                </span>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  entry.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : entry.status === 'processing'
                    ? 'bg-yellow-100 text-yellow-700'
                    : entry.status === 'pending'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
              </span>
            </div>
            {entry.status === 'completed' && entry.extractedText && (
              <div className="mt-2">
                <div className="text-xs text-gray-400 mb-1">Extracted Text:</div>
                <pre className="bg-gray-50 p-2 rounded text-sm max-h-48 overflow-y-auto whitespace-pre-wrap">{entry.extractedText}</pre>
              </div>
            )}
            {entry.status === 'error' && entry.errorMessage && (
              <div className="mt-2 text-red-500 text-sm">Error: {entry.errorMessage}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentUpload;