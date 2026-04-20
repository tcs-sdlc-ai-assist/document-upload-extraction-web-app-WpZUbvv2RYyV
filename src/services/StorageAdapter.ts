import type { DocumentEntry, User } from '../types';

/**
 * StorageAdapter for document entries in localStorage, namespaced per user.
 * All documents for a user are stored under 'docproc:<username>:documents'.
 */

function getStorageKey(username: string): string {
  return `docproc:${username}:documents`;
}

/**
 * Loads all document entries for the given user from localStorage.
 * @param username User's name (must be unique)
 * @returns DocumentEntry[]
 */
export function loadDocuments(username: string): DocumentEntry[] {
  const key = getStorageKey(username);
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return [];
    const docs = JSON.parse(value) as DocumentEntry[];
    if (!Array.isArray(docs)) return [];
    return docs;
  } catch {
    return [];
  }
}

/**
 * Saves all document entries for the given user to localStorage.
 * @param username User's name (must be unique)
 * @param docs Array of DocumentEntry
 */
export function saveDocuments(username: string, docs: DocumentEntry[]): void {
  const key = getStorageKey(username);
  try {
    window.localStorage.setItem(key, JSON.stringify(docs));
  } catch {
    // ignore quota/storage errors
  }
}

/**
 * Adds a new document entry for the user.
 * @param username User's name
 * @param doc DocumentEntry to add
 */
export function addDocument(username: string, doc: DocumentEntry): void {
  const docs = loadDocuments(username);
  saveDocuments(username, [doc, ...docs]);
}

/**
 * Updates a document entry by id for the user.
 * @param username User's name
 * @param id DocumentEntry id
 * @param update Partial<DocumentEntry>
 */
export function updateDocument(
  username: string,
  id: string,
  update: Partial<DocumentEntry>
): void {
  const docs = loadDocuments(username);
  const updated = docs.map((d) =>
    d.id === id ? { ...d, ...update } : d
  );
  saveDocuments(username, updated);
}

/**
 * Removes a document entry by id for the user.
 * @param username User's name
 * @param id DocumentEntry id
 */
export function removeDocument(username: string, id: string): void {
  const docs = loadDocuments(username).filter((d) => d.id !== id);
  saveDocuments(username, docs);
}

/**
 * Clears all document entries for the user.
 * @param username User's name
 */
export function clearDocuments(username: string): void {
  const key = getStorageKey(username);
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}