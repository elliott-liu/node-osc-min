import {
  oscTypeCodes,
  typeStringToOscTypeCode,
  type OscTypeCodeSplitResult,
} from "src/osc-utilities";
import type { ArgRepresentation } from "src/types";

/**
 * Splits out an argument from a buffer. Same thing as splitOscString but works for all argument types.
 *
 * @param buffer - The buffer to split the argument from.
 * @param type - The type of the argument.
 * @param strict - Whether to strictly split the argument.
 * @returns The split argument.
 * @throws If the type is not understood.
 */
export function splitOscArgument(
  buffer: Buffer,
  type: ArgRepresentation | string,
  strict: boolean = false,
): OscTypeCodeSplitResult {
  const oscTypeCode = typeStringToOscTypeCode(type);
  if (oscTypeCode) {
    return oscTypeCodes[oscTypeCode].split(buffer, strict);
  } else {
    throw new Error(`I don't understand how I'm supposed to unpack ${type}.`);
  }
}
