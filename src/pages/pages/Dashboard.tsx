import React, { useEffect, useState } from 'react';
import type { DocumentEntry, User } from '../../types';

interface DashboardProps {}

const fetchRecentDocuments = async (): Promise<DocumentEntry[]> => {
  // Simulate API call with delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          fileName: 'Invoice_June.pdf',
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          uploadedBy: {
            id: 'u1',
            name: 'Alice Smith',
            email: 'alice@example.com',
          },
          status: 'completed',
          extractedText: 'Invoice details...',
        },
        {
          id: '2',
          fileName: 'Contract_Acme.docx',
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          uploadedBy: {
            id: 'u2',
            name: 'Bob Lee',
            email: 'bob@example.com',
          },
          status: 'processing',
        },
        {
          id: '3',
          fileName: 'Report_Q2.pdf',
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          uploadedBy: {
            id: 'u1',
            name: 'Alice Smith',
            email: 'alice@example.com',
          },
          status: 'error',
          errorMessage: 'Failed to extract text.',
        },
      ]);
    }, 900);
  });
};

const Dashboard: React.FC<DashboardProps> = () => {
  const [recentDocs, setRecentDocs] = useState<DocumentEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchRecentDocuments()
      .then((docs) => {
        if (mounted) {
          setRecentDocs(docs);
          setError(null);
        }
      })
      .catch((e) => {
        if (mounted) setError('Failed to load recent documents.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Welcome to your Dashboard</h1>
      <p className="text-gray-600 mb-8">Quickly upload, extract, and manage your documents.</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          onClick={() => window.location.assign('/upload')}
        >
          Upload New Document
        </button>
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition"
          onClick={() => window.location.assign('/extract')}
        >
          Extract Text
        </button>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
        {loading && (
          <div className="text-gray-500">Loading recent documents...</div>
        )}
        {error && (
          <div className="text-red-600">{error}</div>
        )}
        {!loading && !error && recentDocs.length === 0 && (
          <div className="text-gray-500">No documents uploaded yet.</div>
        )}
        {!loading && !error && recentDocs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">File Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Uploaded By</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Uploaded At</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map((doc) => (
                  <tr key={doc.id} className="border-t">
                    <td className="px-4 py-2">{doc.fileName}</td>
                    <td className="px-4 py-2">{doc.uploadedBy.name}</td>
                    <td className="px-4 py-2">
                      {new Date(doc.uploadedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      {doc.status === 'completed' && (
                        <span className="text-green-700 font-semibold">Completed</span>
                      )}
                      {doc.status === 'processing' && (
                        <span className="text-yellow-700 font-semibold">Processing</span>
                      )}
                      {doc.status === 'pending' && (
                        <span className="text-gray-700 font-semibold">Pending</span>
                      )}
                      {doc.status === 'error' && (
                        <span className="text-red-700 font-semibold">Error</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {doc.status === 'completed' && (
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => window.location.assign(`/documents/${doc.id}`)}
                        >
                          View
                        </button>
                      )}
                      {doc.status === 'error' && doc.errorMessage && (
                        <span className="text-red-500" title={doc.errorMessage}>
                          !
                        </span>
                      )}
                      {(doc.status === 'pending' || doc.status === 'processing') && (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;