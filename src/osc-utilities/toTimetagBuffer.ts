import { concat, dateToTimetag, timestampToTimetag } from "src/osc-utilities";
import type { Timetag } from "src/types";

/**
 * Encodes a timetag of type `null` | `Number` | `Array` | `Date` as a Buffer for adding to an OSC bundle.
 * @param timetag - The timetag to encode.
 * @returns The encoded timetag as a Buffer.
 */
export function toTimetagBuffer(
  timetag: null | number | Timetag | Date,
): Buffer {
  if (typeof timetag === "number") {
    timetag = timestampToTimetag(timetag);
  } else if (typeof timetag === "object" && timetag instanceof Date) {
    timetag = dateToTimetag(timetag);
  } else if (timetag === null) {
    throw new Error("Timetag is null.");
  } else if (timetag.length !== 2) {
    throw new Error(`Invalid timetag: ${timetag}.`);
  }

  const high = Buffer.alloc(4);
  high.writeUInt32BE(timetag[0], 0);

  const low = Buffer.alloc(4);
  high.writeUInt32BE(timetag[1], 0);

  return concat([high, low]);
}
