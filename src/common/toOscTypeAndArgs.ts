import { getArrayArg } from "src/common";
import {
  argToTypeCode,
  oscTypeCodeToTypeString,
  toOscArgument,
} from "src/osc-utilities";

export type OscTypeAndArgs = [string, Buffer[]];

/**
 * Converts an argument list into a pair of a type string and a data buffer.
 *
 * @param argList - The argument list to convert.
 * @param strict - Indicates whether strict mode is enabled.
 * @returns An array containing the type string and the data buffer.
 */
export function toOscTypeAndArgs(
  argList: any[],
  strict: boolean,
): OscTypeAndArgs {
  let oscType = "";
  let oscArgs: Buffer[] = [];

  for (const arg of argList) {
    const arrayArg = getArrayArg(arg);

    if (arrayArg) {
      const [thisType, thisArgs] = toOscTypeAndArgs(arrayArg, strict);
      oscType += "[" + thisType + "]";
      oscArgs = oscArgs.concat(thisArgs);
      continue;
    }

    const typeCode = argToTypeCode(arg, strict);

    if (typeCode) {
      let value = arg?.value;

      if (value === undefined) {
        value = arg;
      }

      const buffer = toOscArgument(
        value,
        oscTypeCodeToTypeString(typeCode) || "",
        strict,
      );

      if (buffer) {
        oscArgs.push(buffer);
        oscType += typeCode;
      }
    }
  }

  return [oscType, oscArgs];
}
