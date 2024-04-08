import { StrictError } from "src/common";
import { oscTypeCodeToTypeString } from "src/osc-utilities/oscTypeCodeToTypeString";
import { splitOscArgument } from "src/osc-utilities/splitOscArgument";
import { splitOscString } from "src/osc-utilities/splitOscString";

export type OscMessageResult = {
  address: string;
  args: unknown[];
  oscType?: OscType;
};

export type OscType = "message" | "bundle";

/**
 * Translates an OSC message into a JavaScript representation.
 *
 * @param buffer - The OSC message buffer.
 * @param strict - Indicates whether to enforce strict parsing rules.
 * @returns The JavaScript representation of the OSC message.
 * @throws If strict mode is enabled and the OSC message violates the rules.
 * @throws If the OSC message contains an unknown argument code.
 */
export function fromOscMessage(
  buffer: Buffer,
  strict: boolean,
): OscMessageResult {
  // Break off the address
  const { string: address, rest: remainingBuffer } = splitOscString(
    buffer,
    strict,
  );

  // Technically, addresses have to start with '/'
  if (strict && address[0] !== "/") {
    throw new StrictError("Addresses must start with /");
  }

  // If there's no type string, return an empty argument list
  // The specification says we should accept this until all implementations that send message without a type string are fixed
  // This will never happen, so we should accept this, even in strict mode
  if (!remainingBuffer.length) {
    return { address, args: [] };
  }

  // If there's more data but no type string, we can't parse the arguments
  let { string: types, rest: argsBuffer } = splitOscString(
    remainingBuffer,
    strict,
  );

  // If the first letter isn't a ',', this isn't a valid type, so we can't parse the arguments
  if (types[0] !== ",") {
    if (strict) {
      throw new StrictError("Argument lists must begin with ','.");
    }
    return { address, args: [] };
  }

  // Remove the comma from the types string
  const typesWithoutComma = types.slice(1);

  const args: unknown[] = [];

  // We use this to build up array arguments
  // arrayStack[-1] is always the currently constructing array
  const arrayStack = [args];

  // Iterate over each argument type
  for (const type of typesWithoutComma) {
    // Special case: beginning construction of an array
    if (type === "[") {
      arrayStack.push([]);
      continue;
    }

    // Special case: finished constructing an array
    if (type === "]") {
      if (arrayStack.length <= 1) {
        throw new StrictError("Mismatched ']' character.");
      } else {
        const built = arrayStack.pop();
        const lastArrayElement = arrayStack[arrayStack.length - 1];

        if (lastArrayElement) {
          lastArrayElement.push({
            type: "array",
            value: built,
          });
        }
      }
      continue;
    }

    // By the standard, we have to ignore the whole message if we don't understand an argument
    const typeString = oscTypeCodeToTypeString(type);
    if (!typeString) {
      throw new Error(`I don't understand the argument code '${type}'.`);
    }

    const arg = splitOscArgument(argsBuffer, typeString, strict);

    // Consume the argument from the buffer
    if (arg) {
      argsBuffer = arg.rest;
    }

    // Add the argument to the list
    const currentArray = arrayStack[arrayStack.length - 1];
    if (currentArray) {
      currentArray.push({
        type: typeString,
        value: arg?.value,
      });
    }
  }

  if (arrayStack.length !== 1 && strict) {
    throw new StrictError("Mismatched '[' character");
  }

  return { address, args, oscType: "message" };
}
