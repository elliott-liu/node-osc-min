/**
 * Calculate the padding required for an osc-string.
 *
 * @param string - The osc-string.
 * @returns The padding required for the osc-string.
 */
export function padding(string: string): number {
  const length = Buffer.byteLength(string);
  return 4 - (length % 4);
}
