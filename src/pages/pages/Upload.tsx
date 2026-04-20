import React, { useState } from 'react';
import type { DocumentEntry, User } from '../../types';

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
  error: string | null;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload, uploading, error }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    await onUpload(selectedFile);
    setSelectedFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        disabled={uploading}
      />
      <button
        type="submit"
        className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        disabled={!selectedFile || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload Document'}
      </button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </form>
  );
};

interface ResultsDisplayProps {
  entries: DocumentEntry[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ entries }) => {
  if (!entries.length) {
    return (
      <div className="text-gray-500 text-center mt-8">No documents uploaded yet.</div>
    );
  }

  return (
    <div className="mt-10 w-full max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Uploaded Documents</h2>
      <div className="space-y-4">
        {entries.map(entry => (
          <div key={entry.id} className="p-4 rounded shadow bg-white border">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{entry.fileName}</span>
                <span className="ml-2 text-xs text-gray-400">({new Date(entry.uploadedAt).toLocaleString()})</span>
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
                <pre className="bg-gray-50 p-2 rounded text-sm max-h-48 overflow-y-auto">{entry.extractedText}</pre>
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

const Upload: React.FC = () => {
  const [entries, setEntries] = useState<DocumentEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulated upload handler (replace with real API call)
  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      // Simulate upload and extraction
      const id = Math.random().toString(36).slice(2);
      const now = new Date().toISOString();
      const newEntry: DocumentEntry = {
        id,
        fileName: file.name,
        uploadedAt: now,
        uploadedBy: {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
        },
        status: 'processing',
      };
      setEntries(prev => [newEntry, ...prev]);

      // Simulate processing delay
      await new Promise(res => setTimeout(res, 1500));

      // Simulate extraction result
      setEntries(prev =>
        prev.map(e =>
          e.id === id
            ? {
                ...e,
                status: 'completed',
                extractedText: `Extracted text from "${file.name}" (simulated).`,
              }
            : e
        )
      );
    } catch (e) {
      setError('Failed to upload document.');
      setEntries(prev =>
        prev.map(e =>
          e.status === 'processing'
            ? { ...e, status: 'error', errorMessage: 'Upload failed.' }
            : e
        )
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">Upload Document</h1>
      <DocumentUpload onUpload={handleUpload} uploading={uploading} error={error} />
      <ResultsDisplay entries={entries} />
    </div>
  );
};

export default Upload;