import {
  oscTypeCodes,
  type OscTypeCode,
  type TypeCode,
  type TypeCodeRepresentation,
} from "src/osc-utilities";

/**
 * Converts a JavaScript string representation into its OSC type code.
 *
 * @param {TypeCodeRepresentation | string} typeCodeRepresentation - The representation to convert.
 * @returns {TypeCode | null} The OSC type code, or null if not found.
 */
export function typeStringToOscTypeCode(
  typeCodeRepresentation: TypeCodeRepresentation | string,
): TypeCode | null {
  for (const code in oscTypeCodes) {
    if (oscTypeCodes.hasOwnProperty(code)) {
      const { representation } = oscTypeCodes[code] as OscTypeCode;
      if (representation === typeCodeRepresentation) {
        return code as TypeCode;
      }
    }
  }
  return null;
}
