import { mapBundleList } from "src/common";
import {
  applyTransform,
  splitOscString,
  toIntegerBuffer,
  toOscString,
} from "src/osc-utilities";

export type MessageTransform = {
  (buffer: Buffer): Buffer;
};

/**
 * Helper function for transforming all messages in a bundle with a given message transform.
 *
 * @param transform - The message transform function.
 * @returns The transformed bundle function.
 */
export function applyMessageTransformerToBundle(
  transform: MessageTransform,
): MessageTransform {
  return (buffer: Buffer) => {
    // Parse out the bundle-id and the tag, we don't want to change these
    const { string, rest: remainingBuffer } = splitOscString(buffer);

    // Bundles have to start with "#bundle"
    if (string !== "#bundle") {
      throw new Error("osc-bundles must begin with '#bundle'.");
    }

    const bundleTagBuffer = toOscString(string);

    // We know that the timetag is 8 bytes, we don't want to mess with it, so grab it as a buffer
    // There is some subtle loss of precision with the round trip from Int64 to Float64
    const timetagBuffer = buffer.subarray(0, 8);
    buffer = buffer.subarray(8, buffer.length);

    // Convert each element
    const elements = mapBundleList(remainingBuffer, (buffer) =>
      applyTransform(
        buffer,
        transform,
        applyMessageTransformerToBundle(transform),
      ),
    );

    let totalLength = bundleTagBuffer.length + timetagBuffer.length;

    for (const element in elements) {
      totalLength += 4 + element.length;
    }

    // Okay, now we have to re-concatenate everything
    const outBuffer = Buffer.alloc(totalLength);
    bundleTagBuffer.copy(outBuffer, 0);
    timetagBuffer.copy(outBuffer, bundleTagBuffer.length);

    let copyIndex = bundleTagBuffer.length + timetagBuffer.length;
    for (const element of elements) {
      const lengthBuff = toIntegerBuffer(element.length);
      lengthBuff.copy(outBuffer, copyIndex);
      copyIndex += 4;
      element.copy(outBuffer, copyIndex);
      copyIndex += element.length;
    }

    return outBuffer;
  };
}

// FIXME Provide an alias for backwards compatibility with the old name
export const applyMessageTranformerToBundle = applyMessageTransformerToBundle;
