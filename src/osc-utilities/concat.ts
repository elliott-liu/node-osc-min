/**
 * Utility for working with buffers.
 *
 * Takes an array of buffers, output one buffer with all of the array concatenated.
 *
 * This is really only exported for TDD, but maybe it'll be useful to someone else too.
 *
 * @param buffers - Array of buffers to concatenate.
 * @returns The concatenated buffer.
 */
export function concat(buffers: Buffer[]): Buffer {
  if (!Array.isArray(buffers)) {
    throw new Error("Concat must take an array of buffers.");
  }

  for (const buffer of buffers) {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error("Concat must take an array of buffers.");
    }
  }

  let sumLength = 0;
  for (const buffer of buffers) {
    sumLength += buffer.length;
  }

  const destBuffer = Buffer.alloc(sumLength);

  let copyTo = 0;
  for (const buffer of buffers) {
    buffer.copy(destBuffer, copyTo);
    copyTo += buffer.length;
  }

  return destBuffer;
}
