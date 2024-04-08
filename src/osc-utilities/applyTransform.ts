import { isOscBundleBuffer } from "src/common";
import {
  applyMessageTransformerToBundle,
  type MessageTransform,
} from "src/osc-utilities";

/**
 * Applies a transformation function (that is, a function from buffers to buffers) to each element of given osc-bundle or message.
 *
 * @param buffer - The buffer to transform, which must be a buffer of a full packet.
 * @param messageTransform - Function from message buffers to message buffers.
 * @param bundleTransform - Optional parameter for functions from bundle buffers to bundle buffers. If not set, it defaults to just applying the `messageTransform` to each message in the bundle.
 * @returns The transformed buffer.
 */
export function applyTransform(
  buffer: Buffer,
  messageTransform: MessageTransform,
  bundleTransform?: MessageTransform,
): Buffer {
  if (!bundleTransform) {
    bundleTransform = applyMessageTransformerToBundle(messageTransform);
  }

  if (isOscBundleBuffer(buffer)) {
    return bundleTransform(buffer);
  } else {
    return messageTransform(buffer);
  }
}
