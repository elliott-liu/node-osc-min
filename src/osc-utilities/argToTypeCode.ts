import { typeStringToOscTypeCode } from "src/osc-utilities";

/**
 * Converts an argument to its corresponding OSC type code.
 *
 * @param arg - The argument to convert.
 * @param strict - Whether to throw an error if the argument has no value.
 * @returns The OSC type code.
 * @throws If the argument has no value and strict is true, or if the type is unknown.
 */
export function argToTypeCode(arg: any, strict: boolean): string {
  // If there's an explicit type annotation, back-translate that
  if (arg?.type && typeof arg.type === "string") {
    const code = typeStringToOscTypeCode(arg.type);
    if (code) {
      return code;
    }
  }

  const value = arg?.value ?? arg;

  // Now, we try to guess the type
  if (strict && !value) {
    throw new Error("Argument has no value.");
  }

  // If it's a string, use 's'
  if (typeof value === "string") {
    return "s";
  }

  // If it's a number, use 'f' by default
  if (typeof value === "number") {
    return "f";
  }

  // If it's a buffer, use 'b'
  if (Buffer.isBuffer(value)) {
    return "b";
  }

  // These are 1.1 specific types

  // If it's a boolean, use 'T' or 'F'
  if (typeof value === "boolean") {
    return value ? "T" : "F";
  }

  // If it's null, use 'N'
  if (value === null) {
    return "N";
  }

  throw new Error("I don't know what type this is supposed to be.");
}
