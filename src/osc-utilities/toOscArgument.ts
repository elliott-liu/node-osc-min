import { typeStringToOscTypeCode, oscTypeCodes } from "src/osc-utilities";
import type { ArgRepresentation } from "src/types";

/**
 * Create a buffer with the given JavaScript type.
 *
 * @param value - The value to convert to an OSC argument.
 * @param type - The JavaScript type of the value.
 * @param strict - Whether to strictly enforce OSC argument types.
 * @returns The OSC argument buffer.
 * @throws An error if the type is not supported.
 */
export function toOscArgument(
  value: any,
  type: ArgRepresentation | string,
  strict: boolean = false,
): Buffer {
  const oscTypeCode = typeStringToOscTypeCode(type);
  if (oscTypeCode) {
    return oscTypeCodes[oscTypeCode].toArg(value, strict);
  } else {
    throw new Error(`I don't know how to pack '${type}'.`);
  }
}
