import {
  oscTypeCodes,
  type TypeCode,
  type TypeCodeRepresentation,
} from "src/osc-utilities";

/**
 * Converts an OSC type code into its JavaScript string representation.
 *
 * @param {TypeCode | string} code - The OSC type code.
 * @returns {TypeCodeRepresentation | undefined} The JavaScript string representation of the type code, or undefined if the type code is not recognized.
 */
export function oscTypeCodeToTypeString(
  code: TypeCode | string,
): TypeCodeRepresentation | undefined {
  return oscTypeCodes[code]?.representation;
}
