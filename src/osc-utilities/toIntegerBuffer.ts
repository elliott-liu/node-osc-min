import { StrictError } from "src/common";
import type { BufferType } from "src/types";

/**
 * Converts a number to an integer buffer of the specified type.
 *
 * @param number The number to convert.
 * @param type The type of buffer to create. Defaults to "Int32".
 * @returns The buffer containing the converted number.
 * @throws Error if the input number is not a valid number.
 * @throws Error if the specified type is not supported.
 */
export function toIntegerBuffer(
  number: number,
  type: BufferType = "Int32",
): Buffer {
  if (typeof number !== "number") {
    throw new Error("Cannot pack a non-number into an integer buffer");
  }
  const buffer = Buffer.alloc(4);

  switch (type) {
    case "Float64":
      buffer.writeDoubleBE(number, 0);
      break;
    case "Float32":
      buffer.writeFloatBE(number, 0);
      break;
    case "Int32":
      buffer.writeInt32BE(number, 0);
      break;
    case "Int16":
      buffer.writeInt16BE(number, 0);
      break;
    case "Int8":
      buffer.writeInt8(number, 0);
      break;
    case "UInt32":
      buffer.writeUInt32BE(number, 0);
      break;
    case "UInt16":
      buffer.writeUInt16BE(number, 0);
      break;
    case "UInt8":
      buffer.writeUInt8(number, 0);
      break;
    default:
      throw new StrictError(`Unsupported type: ${type}.`);
  }

  return buffer;
}
