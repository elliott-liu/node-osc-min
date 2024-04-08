export type SplitTimetagResult = { timetag: [number, number]; rest: Buffer };

/**
 * Split off an OSC timetag from buffer.
 *
 * @param {Buffer} buffer - The buffer containing the timetag.
 * @returns {SplitTimetagResult} - The split timetag and the rest of the buffer.
 * @throws {Error} - If the buffer is not big enough to contain a timetag.
 */
export function splitTimetag(buffer: Buffer): SplitTimetagResult {
  const UINT32_BYTES: number = 4; // UInt32 is 4 bytes

  if (buffer.length < UINT32_BYTES * 2) {
    throw new Error("Buffer is not big enough to contain a timetag.");
  }

  // Integers are stored in big endian format.
  const seconds: number = buffer.readUInt32BE(0);
  const fractional: number = buffer.readUInt32BE(UINT32_BYTES);

  // Create a subarray for the rest of the buffer
  const rest: Buffer = buffer.subarray(UINT32_BYTES * 2);

  return { timetag: [seconds, fractional], rest };
}
