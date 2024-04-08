import { StrictError } from "src/common";
import type { BufferType } from "src/types";

export type SplitIntegerResult = {
  integer: number;
  rest: Buffer;
};

/**
 * Splits an integer value from a buffer based on the specified type.
 *
 * This has similar semantics to splitOscString but works with integers instead.
 *
 * @param {Buffer} buffer - The buffer containing the integer value.
 * @param {BufferType} type - The type of the integer value. Defaults to "Int32".
 * @returns {SplitIntegerResult} An object containing the split integer value and the remaining buffer.
 * @throws Error if the integer type is unsupported or if the buffer is not big enough.
 */
export function splitInteger(
  buffer: Buffer,
  type: BufferType = "Int32",
): SplitIntegerResult {
  let bytes: number;
  let value: number;

  switch (type) {
    case "Float64":
      bytes = 8;
      value = buffer.readDoubleBE(0);
      break;
    case "Float32":
      bytes = 4;
      value = buffer.readFloatBE(0);
      break;
    case "Int32":
      bytes = 4;
      value = buffer.readInt32BE(0);
      break;
    case "Int16":
      bytes = 2;
      value = buffer.readInt16BE(0);
      break;
    case "Int8":
      bytes = 1;
      value = buffer.readInt8(0);
      break;
    case "UInt32":
      bytes = 4;
      value = buffer.readUInt32BE(0);
      break;
    case "UInt16":
      bytes = 2;
      value = buffer.readUInt16BE(0);
      break;
    case "UInt8":
      bytes = 1;
      value = buffer.readUInt8(0);
      break;
    default:
      throw new StrictError(`Unsupported integer type: ${type}.`);
  }

  if (buffer.length < bytes) {
    throw new Error("Buffer is not big enough for integer type.");
  }

  const rest = buffer.subarray(bytes);

  return { integer: value, rest: rest };
}
