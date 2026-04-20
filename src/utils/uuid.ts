// src/utils/uuid.ts

/**
 * Generates a RFC4122 version 4 compliant UUID.
 * @returns {string} A randomly generated UUID v4 string.
 */
export function generateUUID(): string {
  // Credit: https://stackoverflow.com/a/2117523/2715716
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}