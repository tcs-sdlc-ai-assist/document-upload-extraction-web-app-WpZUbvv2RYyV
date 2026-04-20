/**
 * Hashes a password using SHA-256 and returns the hex string.
 * Uses the browser's SubtleCrypto API.
 * @param password The password to hash
 * @returns Promise<string> The hex-encoded SHA-256 hash
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}