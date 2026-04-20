import { MAX_FILE_SIZE_BYTES, SUPPORTED_FILE_TYPES } from '../constants';

/**
 * Validation result for a file upload.
 */
export interface ValidationResult {
  valid: boolean;
  error?: ValidationError;
}

/**
 * Error codes for file validation.
 */
export type ValidationError =
  | 'UNSUPPORTED_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'NO_FILE_SELECTED';

/**
 * Validates a file for upload.
 * - Checks type (PDF, DOCX, TXT)
 * - Checks size (<= MAX_FILE_SIZE_BYTES)
 * @param file File to validate
 * @returns ValidationResult
 */
export function validateFile(file: File | null): ValidationResult {
  if (!file) {
    return { valid: false, error: 'NO_FILE_SELECTED' };
  }

  // Accept .pdf, .docx, .txt by MIME or extension
  const allowed =
    SUPPORTED_FILE_TYPES.includes(file.type) ||
    file.name.toLowerCase().endsWith('.pdf') ||
    file.name.toLowerCase().endsWith('.docx') ||
    file.name.toLowerCase().endsWith('.txt');

  if (!allowed) {
    return { valid: false, error: 'UNSUPPORTED_FILE_TYPE' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'FILE_TOO_LARGE' };
  }

  return { valid: true };
}