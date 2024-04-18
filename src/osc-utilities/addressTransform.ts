import { concat, splitOscString, toOscString } from "src/osc-utilities";
import type { MessageTransform, TransformAddress } from "src/types";

/**
 * Converts a JavaScript function from string to string to a function from message buffer to message buffer, applying the function to the parsed strings.
 *
 * We pre-curry this because we expect to use this with `applyMessageTransform` above.
 *
 * @param transform - The transform function to apply to the parsed string.
 * @returns The transformed function that takes a message buffer and returns a transformed message buffer.
 */
export function addressTransform(
  transform: TransformAddress,
): MessageTransform {
  return (buffer) => {
    // Parse out the address
    const { string, rest } = splitOscString(buffer);

    // Apply the function
    const transformedString = transform(string);

    // Re-concatenate
    return concat([toOscString(transformedString), rest]);
  };
}
