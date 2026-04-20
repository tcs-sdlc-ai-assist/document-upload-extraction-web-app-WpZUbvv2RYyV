// App-wide constants for doc-upload-extract

export const LOCAL_STORAGE_SESSION_KEY = 'doc-upload-extract.session';
export const LOCAL_STORAGE_USER_KEY = 'doc-upload-extract.user';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'text/plain'
];

export const FILE_UPLOAD_FIELD_NAME = 'document';

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  error: 'Error'
};