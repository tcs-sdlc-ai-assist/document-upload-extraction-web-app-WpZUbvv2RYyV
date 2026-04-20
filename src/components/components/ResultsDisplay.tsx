import React from 'react';
import type { DocumentEntry } from '../../types';

interface ResultsDisplayProps {
  documents: DocumentEntry[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ documents }) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-gray-500 text-center mt-8">
        No documents uploaded yet.
      </div>
    );
  }

  return (
    <div className="mt-10 w-full max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Uploaded Documents</h2>
      <div className="space-y-4">
        {documents.map((entry) => (
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
                <pre className="bg-gray-50 p-2 rounded text-sm max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {entry.extractedText}
                </pre>
              </div>
            )}
            {entry.status === 'error' && entry.errorMessage && (
              <div className="mt-2 text-red-500 text-sm">
                Error: {entry.errorMessage}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsDisplay;