import React, { useState } from 'react';
import type { DocumentEntry } from '../../types';
import { useDocumentManager } from '../../hooks/useDocumentManager';
import AccessibleButton from './AccessibleButton';
import StatusMessage from './StatusMessage';

interface DocumentListProps {
  entries: DocumentEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  entries,
  selectedId,
  onSelect,
  onDelete,
}) => {
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
          onClick={() => onSelect(entry.id)}
          aria-current={selectedId === entry.id ? 'true' : undefined}
        >
          <div>
            <div className="font-medium text-gray-900">{entry.fileName}</div>
            <div className="text-xs text-gray-500">
              Uploaded by {entry.uploadedBy.name} &middot;{' '}
              {new Date(entry.uploadedAt).toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            <AccessibleButton
              onClick={e => {
                e.stopPropagation();
                onDelete(entry.id);
              }}
              ariaLabel="Delete document"
              className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              &times;
            </AccessibleButton>
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

const DocumentHistory: React.FC = () => {
  const {
    documents,
    deleteDocument,
    status,
    error,
    refresh,
  } = useDocumentManager();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  React.useEffect(() => {
    if (documents.length > 0 && !selectedId) {
      setSelectedId(documents[0].id);
    } else if (documents.length === 0) {
      setSelectedId(null);
    } else if (selectedId && !documents.some(d => d.id === selectedId)) {
      setSelectedId(documents[0]?.id ?? null);
    }
  }, [documents, selectedId]);

  const selectedEntry =
    documents.find((e) => e.id === selectedId) || null;

  return (
    <div className="max-w-5xl mx-auto mt-8 bg-white rounded shadow-md flex flex-col md:flex-row min-h-[400px]">
      <div className="md:w-1/3 border-r border-gray-200 bg-gray-50">
        <div className="p-4 border-b border-gray-200 font-semibold text-gray-700 flex items-center justify-between">
          <span>Document History</span>
          <AccessibleButton
            onClick={refresh}
            ariaLabel="Refresh history"
            className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            &#x21bb;
          </AccessibleButton>
        </div>
        {status === 'idle' || status === 'success' ? (
          <DocumentList
            entries={documents}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={deleteDocument}
          />
        ) : status === 'error' && error ? (
          <StatusMessage status="error" message={error.message} />
        ) : (
          <div className="text-center py-8 text-blue-500">Loading...</div>
        )}
      </div>
      <div className="flex-1">
        <ResultsDisplay entry={selectedEntry} />
      </div>
    </div>
  );
};

export default DocumentHistory;