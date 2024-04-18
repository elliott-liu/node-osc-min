import { fromOscMessage, toOscMessage } from "src/osc-utilities";
import type { MessageTransform, TransformMessage } from "src/types";

/**
 * Take a function that transforms a JavaScript _OSC Message_ and convert it to a function that transforms OSC buffers.
 *
 * @param transform - The transform function for OSC messages.
 * @returns The transform function for OSC buffers.
 */
export function messageTransform(
  transform: TransformMessage,
): MessageTransform {
  return (buffer) => {
    const message = fromOscMessage(buffer);
    return toOscMessage(transform(message));
  };
}
