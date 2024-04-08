import { StrictError } from "src/common";

/**
 * Convert a JavaScript string into a Node.js Buffer containing an OSC-String.
 * @param string The string to convert.
 * @param strict Optional boolean parameter that fails if the string is invalid (i.e. contains a \u0000 character).
 * @returns A Node.js Buffer containing the OSC-String.
 * @throws If the input is not a string.
 * @throws If the string contains NULL characters and strict mode is enabled.
 */
export function toOscString(string: string, strict?: boolean): Buffer {
  if (typeof string !== "string") {
    throw new Error("Can't pack a non-string into an OSC-String");
  }

  // Strip off any \u0000 characters.
  const nullIndex = string.indexOf("\u0000");
  if (nullIndex !== -1 && strict) {
    throw new StrictError(
      "Can't pack an OSC-String that contains NULL characters",
    );
  }
  string = string.substring(0, nullIndex !== -1 ? nullIndex : undefined);

  // OSC-Strings must have length divisible by 4 and end with at least one zero.
  const padding = 4 - (string.length % 4);
  for (let i = 0; i < padding; i++) {
    string += "\u0000";
  }

  // Create a new Buffer from the string.
  return Buffer.from(string);
}
