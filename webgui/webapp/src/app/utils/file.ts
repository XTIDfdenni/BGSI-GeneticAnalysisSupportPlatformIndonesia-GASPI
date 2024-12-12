/**
 * Converts a given number of bytes into a human-readable string format.
 *
 * @param bytes - The number of bytes to be converted.
 * @returns A string representing the size in a more readable format (e.g., '10.24 KB', '1.00 MB').
 *
 * @example
 * ```typescript
 * formatBytes(1024); // '1.00 KB'
 * formatBytes(123456789); // '117.74 MB'
 * ```
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
