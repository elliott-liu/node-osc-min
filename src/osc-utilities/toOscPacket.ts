import { toOscBundle, toOscMessage } from "src/osc-utilities";
import type { OscBundle } from "src/osc-utilities/fromOscBundle";
import type { OscMessage } from "src/osc-utilities/fromOscMessage";

/**
 * Convert a JavaScript format bundle or message into a buffer.
 *
 * @param bundleOrMessage - The bundle or message to convert.
 * @param strict - Whether to strictly validate the input.
 * @returns The converted OSC packet as a buffer.
 */
export function toOscPacket(
  bundleOrMessage: OscMessage | OscBundle | any, // TODO `any`
  strict: boolean,
): Buffer {
  // First, determine whether or not this is a bundle
  if (bundleOrMessage.oscType) {
    if (bundleOrMessage.oscType === "bundle") {
      return toOscBundle(bundleOrMessage, strict);
    }
    return toOscMessage(bundleOrMessage, strict);
  }

  // Bundles have "timetags" and "elements"
  if (bundleOrMessage.timetag || bundleOrMessage.elements) {
    return toOscBundle(bundleOrMessage, strict);
  }

  return toOscMessage(bundleOrMessage, strict);
}
