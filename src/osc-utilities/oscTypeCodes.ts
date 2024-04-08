import { StrictError } from "src/common";
import {
  concat,
  splitInteger,
  splitOscString,
  splitTimetag,
  toIntegerBuffer,
  toOscString,
  toTimetagBuffer,
} from "src/osc-utilities";

export type OscTypeCodes = Record<TypeCode, OscTypeCode>;

export type OscTypeCode = {
  representation: TypeCodeRepresentation;
  split: (buffer: Buffer, strict: boolean) => { value: any; rest: Buffer };
  toArg: (value: any, strict: boolean) => Buffer;
};

export type TypeCode =
  | "s"
  | "i"
  | "t"
  | "f"
  | "d"
  | "b"
  | "T"
  | "F"
  | "N"
  | "I";

export type TypeCodeRepresentation =
  | "string"
  | "integer"
  | "timetag"
  | "float"
  | "double"
  | "blob"
  | "true"
  | "false"
  | "null"
  | "bang";

/**
 * `oscTypeCodes` is an object that maps OSC type codes to their JavaScript representations,
 * and provides functions to split a buffer into a decoded value and the rest of the buffer,
 * and to convert a value of the type to a buffer.
 *
 * Each key in this object is an OSC type code, and the value is an object with the following properties:
 *  - `representation`: The JavaScript string representation of this type.
 *  - `split`: A function that takes a buffer and an optional strict flag, and returns an object with a `value` property
 *              that contains the decoded value, and a `rest` property that contains the rest of the buffer.
 *  - `toArg`: A function that takes a value and an optional strict flag, and returns a buffer that contains the value.
 */
export const oscTypeCodes: OscTypeCodes = {
  s: {
    representation: "string",
    split: (buffer, strict) => {
      // just pass it through to splitOscString
      const split = splitOscString(buffer, strict);
      return { value: split.string, rest: split.rest };
    },
    toArg: (value, strict) => {
      if (typeof value !== "string") {
        throw new Error("Expected `value` to be typeof string.");
      }
      return toOscString(value, strict);
    },
  },
  i: {
    representation: "integer",
    split: (buffer, strict) => {
      const split = splitInteger(buffer);
      return { value: split.integer, rest: split.rest };
    },
    toArg: (value, strict) => {
      if (typeof value !== "number") {
        throw new Error("Expected `value` to be typeof number.");
      }
      return toIntegerBuffer(value);
    },
  },
  t: {
    representation: "timetag",
    split: (buffer, strict) => {
      const split = splitTimetag(buffer);
      return { value: split.timetag, rest: split.rest };
    },
    toArg: (value, strict) => {
      return toTimetagBuffer(value);
    },
  },
  f: {
    representation: "float",
    split: (buffer, strict) => {
      if (buffer.length < 4 && strict) {
        throw new Error("`buffer` is not big enough to contain a float.");
      }
      const value = buffer.readFloatBE(0);
      const rest = buffer.subarray(4);
      return { value, rest };
    },
    toArg: (value, strict) => {
      if (typeof value !== "number") {
        throw new Error("Expected `value` to be typeof number.");
      }
      const buffer = Buffer.alloc(4);
      buffer.writeFloatBE(value, 0);
      return buffer;
    },
  },
  d: {
    representation: "double",
    split: (buffer, strict) => {
      if (buffer.length < 8 && strict) {
        throw new Error("`buffer` is not big enough to contain a double.");
      }
      const value = buffer.readDoubleBE(0);
      const rest = buffer.subarray(8);
      return { value, rest };
    },
    toArg: (value, strict) => {
      if (typeof value !== "number") {
        throw new Error("Expected `value` to be typeof number.");
      }
      const buffer = Buffer.alloc(8);
      buffer.writeDoubleBE(value, 0);
      return buffer;
    },
  },
  b: {
    representation: "blob",
    split: (buffer, strict) => {
      // Not much to do here, first grab a 4 byte int from the buffer
      const { integer: length, rest: remainingBuffer } = splitInteger(buffer);
      const value = remainingBuffer.subarray(0, length);
      return { value, rest: remainingBuffer.subarray(length) };
    },
    toArg: (value, strict) => {
      if (!Buffer.isBuffer(value)) {
        throw new Error("Expected `value` to be typeof Node.js Buffer.");
      }
      const size = toIntegerBuffer(value.length);
      return concat([size, value]);
    },
  },
  T: {
    representation: "true",
    split: (buffer, strict) => {
      return { value: true, rest: buffer };
    },
    toArg: (value, strict) => {
      if (!value && strict) {
        throw new Error("Expected `value` to be true.");
      }
      return Buffer.alloc(0);
    },
  },
  F: {
    representation: "false",
    split: (buffer, strict) => {
      return { value: false, rest: buffer };
    },
    toArg: (value, strict) => {
      if (value && strict) {
        throw new Error("Expected `value` to be false.");
      }
      return Buffer.alloc(0);
    },
  },
  N: {
    representation: "null",
    split: (buffer, strict) => {
      return { value: null, rest: buffer };
    },
    toArg: (value, strict) => {
      if (value && strict) {
        throw new Error("Expected `value` to be null (or false).");
      }
      return Buffer.alloc(0);
    },
  },
  I: {
    representation: "bang",
    split: (buffer, strict) => {
      return { value: "bang", rest: buffer };
    },
    toArg: (value, strict) => {
      return Buffer.alloc(0);
    },
  },
};
