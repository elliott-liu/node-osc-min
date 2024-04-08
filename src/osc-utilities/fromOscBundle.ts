import { mapBundleList } from "src/common";
import { fromOscPacket, splitOscString, splitTimetag } from "src/osc-utilities";
import type { Timetag } from "src/types";

export type OscBundle = {
  timetag: Timetag;
  elements: any;
  oscType: string;
};

/**
 * Try to parse an OSC bundle into a JavaScript object.
 *
 * @param buffer - The OSC bundle buffer.
 * @param strict - Whether to enforce strict parsing.
 * @returns The parsed OSC bundle object.
 * @throws If the OSC bundle is invalid.
 */
export function fromOscBundle(buffer: Buffer, strict: boolean): OscBundle {
  // Break off the bundletag
  const { string: bundleTag, rest: bundleBuffer } = splitOscString(
    buffer,
    strict,
  );

  // Bundles have to start with "#bundle"
  if (bundleTag !== "#bundle") {
    throw new Error("osc-bundles must begin with '#bundle'.");
  }

  // Grab the 8 byte timetag
  const { timetag, rest: timetagBuffer } = splitTimetag(bundleBuffer);

  // Convert each element
  const convertedElements = mapBundleList(timetagBuffer, (buffer: Buffer) => {
    return fromOscPacket(buffer, strict);
  });

  return { timetag: timetag, elements: convertedElements, oscType: "bundle" };
}
