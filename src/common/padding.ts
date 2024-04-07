/**
 * Calculate the padding required for an osc-string.
 *
 * @param str - The osc-string.
 * @returns The padding required for the osc-string.
 */
export function padding(str: string): number {
  const length = Buffer.byteLength(str);
  return (4 - (length % 4)) % 4;
}
