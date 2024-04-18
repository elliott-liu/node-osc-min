import {
  concat,
  toIntegerBuffer,
  toOscPacket,
  toOscString,
  toTimetagBuffer,
} from "src/osc-utilities";
import type { OscBundle } from "src/types";

/**
 * Convert a JavaScript format bundle into an OSC buffer.
 *
 * @param bundle - The bundle to convert.
 * @param strict - Whether to enforce strict rules.
 * @returns The OSC bundle buffer.
 * @throws If the bundle is missing a timetag and strict mode is enabled.
 */
export function toOscBundle(
  bundle: OscBundle,
  strict: boolean = false,
): Buffer {
  // The bundle must have a timetag and elements
  if (strict && !bundle.timetag) {
    throw new Error("Bundles must have timetags.");
  }

  const timetag = bundle.timetag || new Date();
  let elements = bundle.elements || [];

  if (!Array.isArray(elements)) {
    const elementString = elements;
    elements = [];
    elements.push(elementString);
  }

  const oscBundleTag = toOscString("#bundle");
  const oscTimeTag = toTimetagBuffer(timetag);

  const oscElements: Buffer[] = [];
  for (const element of elements) {
    try {
      // Try to convert this sub-element into a buffer
      const buffer = toOscPacket(element, strict);

      // Pack in the size
      const size = toIntegerBuffer(buffer.length);
      oscElements.push(Buffer.concat([size, buffer]));
    } catch (e) {
      // Ignore and continue
    }
  }

  const allElements = concat(oscElements);
  return concat([oscBundleTag, oscTimeTag, allElements]);
}
