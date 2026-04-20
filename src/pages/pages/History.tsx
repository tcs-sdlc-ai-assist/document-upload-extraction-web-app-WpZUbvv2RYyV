import React, { useEffect, useState } from 'react';
import type { DocumentEntry, User } from '../../types';

interface DocumentHistoryProps {
  entries: DocumentEntry[];
  onSelect: (entry: DocumentEntry) => void;
  selectedId: string | null;
}

const DocumentHistory: React.FC<DocumentHistoryProps> = ({ entries, onSelect, selectedId }) => {
  if (entries.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No documents uploaded yet.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
            selectedId === entry.id
              ? 'bg-blue-50 border-l-4 border-blue-500'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => onSelect(entry)}
          aria-current={selectedId === entry.id ? 'true' : undefined}
        >
          <div>
            <div className="font-medium text-gray-900">{entry.fileName}</div>
            <div className="text-xs text-gray-500">
              Uploaded by {entry.uploadedBy.name} &middot;{' '}
              {new Date(entry.uploadedAt).toLocaleString()}
            </div>
          </div>
          <div>
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                entry.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : entry.status === 'processing'
                  ? 'bg-yellow-100 text-yellow-800'
                  : entry.status === 'pending'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};

interface ResultsDisplayProps {
  entry: DocumentEntry | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ entry }) => {
  if (!entry) {
    return (
      <div className="text-gray-400 text-center py-12">
        Select a document to view details.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-2">{entry.fileName}</h2>
      <div className="text-sm text-gray-500 mb-4">
        Uploaded by {entry.uploadedBy.name} &middot;{' '}
        {new Date(entry.uploadedAt).toLocaleString()}
      </div>
      <div className="mb-4">
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
            entry.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : entry.status === 'processing'
              ? 'bg-yellow-100 text-yellow-800'
              : entry.status === 'pending'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
        </span>
      </div>
      {entry.status === 'completed' && entry.extractedText && (
        <div>
          <div className="font-medium mb-1">Extracted Text:</div>
          <pre className="bg-gray-100 rounded p-3 text-sm overflow-x-auto whitespace-pre-wrap">
            {entry.extractedText}
          </pre>
        </div>
      )}
      {entry.status === 'error' && entry.errorMessage && (
        <div className="text-red-600 font-medium">
          Error: {entry.errorMessage}
        </div>
      )}
      {(entry.status === 'pending' || entry.status === 'processing') && (
        <div className="text-blue-500">Processing, please wait...</div>
      )}
    </div>
  );
};

const History: React.FC = () => {
  const [entries, setEntries] = useState<DocumentEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/documents/history');
        if (!response.ok) {
          throw new Error(`Failed to fetch history (${response.status})`);
        }
        const data: DocumentEntry[] = await response.json();
        if (isMounted) {
          setEntries(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load history');
          setLoading(false);
        }
      }
    };
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedEntry = entries.find((e) => e.id === selectedId) || null;

  return (
    <div className="max-w-5xl mx-auto mt-8 bg-white rounded shadow-md flex flex-col md:flex-row min-h-[400px]">
      <div className="md:w-1/3 border-r border-gray-200 bg-gray-50">
        <div className="p-4 border-b border-gray-200 font-semibold text-gray-700">
          Document History
        </div>
        {loading ? (
          <div className="text-center py-8 text-blue-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <DocumentHistory
            entries={entries}
            onSelect={(entry) => setSelectedId(entry.id)}
            selectedId={selectedId}
          />
        )}
      </div>
      <div className="flex-1">
        <ResultsDisplay entry={selectedEntry} />
      </div>
    </div>
  );
};

export default History;