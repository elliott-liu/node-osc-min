import { isOscBundleBuffer } from "src/common";
import { fromOscBundle, fromOscMessage } from "src/osc-utilities";
import type { OscBundle, OscMessage } from "src/types";

/**
 * Convert the buffer into a bundle or a message, depending on the first string.
 *
 * @param buffer - The buffer to convert.
 * @param strict - Whether to enforce strict OSC packet parsing.
 * @returns The converted OSC bundle or message.
 */
export function fromOscPacket(
  buffer: Buffer,
  strict: boolean = false,
): OscMessage | OscBundle {
  if (isOscBundleBuffer(buffer, strict)) {
    return fromOscBundle(buffer, strict);
  } else {
    return fromOscMessage(buffer, strict);
  }
}
