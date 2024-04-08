import {
  typeStringToOscTypeCode,
  oscTypeCodes,
  type TypeCodeRepresentation,
} from "src/osc-utilities";

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
  type: TypeCodeRepresentation | string,
  strict: boolean,
): Buffer {
  const oscTypeCode = typeStringToOscTypeCode(type);
  if (oscTypeCode) {
    return oscTypeCodes[oscTypeCode].toArg(value, strict);
  } else {
    throw new Error(`I don't know how to pack ${type}.`);
  }
}
