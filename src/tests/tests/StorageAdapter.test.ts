import {
  loadDocuments,
  saveDocuments,
  addDocument,
  updateDocument,
  removeDocument,
  clearDocuments,
} from '../../services/StorageAdapter';
import type { DocumentEntry, User } from '../../types';

describe('StorageAdapter', () => {
  const username = 'testuser';
  const storageKey = `docproc:${username}:documents`;

  const user: User = {
    id: 'u1',
    name: 'Test User',
    email: 'test@example.com',
  };

  const doc1: DocumentEntry = {
    id: 'doc1',
    fileName: 'file1.pdf',
    uploadedAt: '2024-06-01T12:00:00Z',
    uploadedBy: user,
    status: 'completed',
    extractedText: 'Text 1',
  };

  const doc2: DocumentEntry = {
    id: 'doc2',
    fileName: 'file2.docx',
    uploadedAt: '2024-06-02T13:00:00Z',
    uploadedBy: user,
    status: 'pending',
  };

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns empty array if no documents are stored', () => {
    expect(loadDocuments(username)).toEqual([]);
  });

  it('saves and loads documents for a user (happy path)', () => {
    saveDocuments(username, [doc1, doc2]);
    const loaded = loadDocuments(username);
    expect(loaded).toHaveLength(2);
    expect(loaded[0].id).toBe('doc1');
    expect(loaded[1].id).toBe('doc2');
  });

  it('addDocument prepends a document to the list', () => {
    saveDocuments(username, [doc2]);
    addDocument(username, doc1);
    const loaded = loadDocuments(username);
    expect(loaded[0].id).toBe('doc1');
    expect(loaded[1].id).toBe('doc2');
  });

  it('updateDocument updates a document by id', () => {
    saveDocuments(username, [doc1, doc2]);
    updateDocument(username, 'doc2', { status: 'completed', extractedText: 'Done' });
    const loaded = loadDocuments(username);
    const updated = loaded.find(d => d.id === 'doc2');
    expect(updated?.status).toBe('completed');
    expect(updated?.extractedText).toBe('Done');
  });

  it('removeDocument removes a document by id', () => {
    saveDocuments(username, [doc1, doc2]);
    removeDocument(username, 'doc1');
    const loaded = loadDocuments(username);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('doc2');
  });

  it('clearDocuments removes all documents for the user', () => {
    saveDocuments(username, [doc1, doc2]);
    clearDocuments(username);
    expect(loadDocuments(username)).toEqual([]);
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it('does not throw if updating a non-existent document', () => {
    saveDocuments(username, [doc1]);
    expect(() =>
      updateDocument(username, 'nonexistent', { status: 'error' })
    ).not.toThrow();
    expect(loadDocuments(username)).toHaveLength(1);
    expect(loadDocuments(username)[0].status).toBe('completed');
  });

  it('does not throw if removing a non-existent document', () => {
    saveDocuments(username, [doc1]);
    expect(() => removeDocument(username, 'nonexistent')).not.toThrow();
    expect(loadDocuments(username)).toHaveLength(1);
  });

  it('handles corrupted JSON gracefully (returns empty array)', () => {
    window.localStorage.setItem(storageKey, '{bad json');
    expect(loadDocuments(username)).toEqual([]);
  });

  it('handles non-array stored value gracefully (returns empty array)', () => {
    window.localStorage.setItem(storageKey, JSON.stringify({ foo: 'bar' }));
    expect(loadDocuments(username)).toEqual([]);
  });
});