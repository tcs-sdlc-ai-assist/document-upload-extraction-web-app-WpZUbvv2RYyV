/**
 * Cleans extracted text by removing unwanted characters and normalizing whitespace.
 * - Removes non-printable/control characters (except \n, \r, \t)
 * - Collapses multiple spaces/tabs into a single space
 * - Trims leading/trailing whitespace on each line
 * - Removes empty lines
 * - Optionally, can lowercase the text (not default)
 */

export interface TextCleanerOptions {
  /**
   * If true, converts text to lowercase.
   * @default false
   */
  toLowerCase?: boolean;
}

/**
 * Cleans up extracted text for display or further processing.
 * @param text Raw extracted text
 * @param options Optional cleaning options
 * @returns Cleaned text string
 */
export function cleanExtractedText(
  text: string,
  options?: TextCleanerOptions
): string {
  let cleaned = text;

  // Remove non-printable/control characters except \n, \r, \t
  cleaned = cleaned.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');

  // Replace tabs with single space
  cleaned = cleaned.replace(/\t+/g, ' ');

  // Collapse multiple spaces into one
  cleaned = cleaned.replace(/ {2,}/g, ' ');

  // Normalize line endings to \n
  cleaned = cleaned.replace(/\r\n?/g, '\n');

  // Trim each line and remove empty lines
  cleaned = cleaned
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');

  if (options?.toLowerCase) {
    cleaned = cleaned.toLowerCase();
  }

  return cleaned;
}