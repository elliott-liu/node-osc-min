import { isOscBundleBuffer } from "src/common";
import {
  fromOscBundle,
  fromOscMessage,
  type OscBundle,
  type OscMessage,
} from "src/osc-utilities";

/**
 * Convert the buffer into a bundle or a message, depending on the first string.
 *
 * @param buffer - The buffer to convert.
 * @param strict - Whether to enforce strict OSC packet parsing.
 * @returns The converted OSC bundle or message.
 */
export function fromOscPacket(
  buffer: Buffer,
  strict: boolean,
): OscMessage | OscBundle {
  if (isOscBundleBuffer(buffer, strict)) {
    return fromOscBundle(buffer, strict);
  } else {
    return fromOscMessage(buffer, strict);
  }
}
