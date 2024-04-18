import { toOscBundle, toOscMessage } from "src/osc-utilities";
import type { OscBundle, OscMessage } from "src/types";

class OscMessageBuffer extends Buffer {}
class OscBundleBuffer extends Buffer {}

/**
 * Convert a JavaScript format bundle or message into a buffer.
 *
 * @param bundleOrMessage - The bundle or message to convert.
 * @param strict - Whether to strictly validate the input.
 * @returns The converted OSC packet as a buffer.
 */
export function toOscPacket(
  bundle: OscBundle,
  strict?: boolean,
): OscBundleBuffer;
export function toOscPacket(
  message: OscMessage,
  strict?: boolean,
): OscMessageBuffer;
export function toOscPacket(
  bundleOrMessage: OscMessage | OscBundle,
  strict: boolean = false,
): OscMessageBuffer | OscBundleBuffer {
  if (isOscBundle(bundleOrMessage)) {
    return toOscBundle(bundleOrMessage, strict);
  }
  return toOscMessage(bundleOrMessage, strict);
}

function isOscBundle(maybeOscBundle: unknown): maybeOscBundle is OscBundle {
  const isOscBundle =
    Object.prototype.hasOwnProperty.call(maybeOscBundle, "timetag") ||
    Object.prototype.hasOwnProperty.call(maybeOscBundle, "elements") ||
    (maybeOscBundle as OscBundle).oscType === "bundle";
  return isOscBundle;
}
