// src/utils/localStorage.ts

import {
  LOCAL_STORAGE_SESSION_KEY,
  LOCAL_STORAGE_USER_KEY,
} from '../constants';
import type { User, Session, DocumentEntry } from '../types';

/**
 * Safely get a value from localStorage and parse as JSON.
 * @param key
 */
function getItem<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Safely set a value in localStorage as JSON.
 * @param key
 * @param value
 */
function setItem<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota/storage errors
  }
}

/**
 * Remove a key from localStorage.
 * @param key
 */
function removeItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// --- User ---

export function getStoredUser(): User | null {
  return getItem<User>(LOCAL_STORAGE_USER_KEY);
}

export function setStoredUser(user: User): void {
  setItem<User>(LOCAL_STORAGE_USER_KEY, user);
}

export function removeStoredUser(): void {
  removeItem(LOCAL_STORAGE_USER_KEY);
}

// --- Session ---

export function getStoredSession(): Session | null {
  return getItem<Session>(LOCAL_STORAGE_SESSION_KEY);
}

export function setStoredSession(session: Session): void {
  setItem<Session>(LOCAL_STORAGE_SESSION_KEY, session);
}

export function removeStoredSession(): void {
  removeItem(LOCAL_STORAGE_SESSION_KEY);
}

// --- Documents ---

const DOCUMENTS_KEY = 'doc-upload-extract.documents';

export function getStoredDocuments(): DocumentEntry[] {
  return getItem<DocumentEntry[]>(DOCUMENTS_KEY) || [];
}

export function setStoredDocuments(docs: DocumentEntry[]): void {
  setItem<DocumentEntry[]>(DOCUMENTS_KEY, docs);
}

export function addStoredDocument(doc: DocumentEntry): void {
  const docs = getStoredDocuments();
  setStoredDocuments([doc, ...docs]);
}

export function removeStoredDocument(id: string): void {
  const docs = getStoredDocuments().filter((d) => d.id !== id);
  setStoredDocuments(docs);
}

export function clearStoredDocuments(): void {
  removeItem(DOCUMENTS_KEY);
}