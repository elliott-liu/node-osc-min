import { oscTypeCodes, type TypeCode } from "src/osc-utilities";
import type { ArgRepresentation } from "src/types";

/**
 * Converts an OSC type code into its JavaScript string representation.
 *
 * @param code - The OSC type code.
 * @returns The JavaScript string representation of the type code, or undefined if the type code is not recognized.
 */
export function oscTypeCodeToTypeString(
  code: TypeCode | string,
): ArgRepresentation | undefined {
  return oscTypeCodes[code]?.representation;
}
