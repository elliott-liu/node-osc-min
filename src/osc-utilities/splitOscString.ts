import { StrictError, padding } from "../common";

/**
 * Try to split a buffer into a leading osc-string and the rest of the buffer.
 *
 * @param {Buffer} buffer - The buffer to split.
 * @param {boolean} strict - An optional boolean parameter, if `true` an invalid buffer will always return `null`. Defaults to `false`.
 * @returns An object containing the split osc-string and the rest of the buffer, with the following layout: `{ string: "blah", rest: Buffer }`.
 * @throws {Error} If the buffer is not a valid buffer or if the osc-string does not contain a null character (in strict mode).
 */
export function splitOscString(
  buffer: Buffer,
  strict: boolean = false,
): { string: string; rest: Buffer } {
  if (!Buffer.isBuffer(buffer)) {
    throw new StrictError("Can't split something that isn't a buffer.");
  }

  // Extract the string
  const rawStr = buffer.toString("utf8");
  const nullIndex = rawStr.indexOf("\u0000");

  // The rest of the code doesn't apply if there's no null character
  if (nullIndex === -1) {
    if (strict) {
      throw new StrictError("All osc-strings must contain a null character.");
    }
    return { string: rawStr, rest: Buffer.alloc(0) };
  }

  // Extract the string
  const str = rawStr.slice(0, nullIndex);

  // Find the length of the string's buffer
  const splitPoint = Buffer.byteLength(str) + padding(str);

  // In strict mode, don't succeed if there's not enough padding
  if (strict && splitPoint > buffer.length) {
    throw new StrictError("Not enough padding for osc-string.");
  }

  // If we're in strict mode, check that all the padding is null
  if (strict) {
    for (let i = Buffer.byteLength(str); i < splitPoint; i++) {
      if (buffer[i] !== 0) {
        throw new StrictError(
          "Not enough or incorrect padding for osc-string.",
        );
      }
    }
  }

  // Return the split
  const rest = buffer.slice(splitPoint);

  return { string: str, rest: rest };
}
