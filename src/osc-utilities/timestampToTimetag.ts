import { makeTimetag } from "src/common";
import type { Timetag } from "src/types";

/**
 * Convert a unix timestamp (seconds since Jan 1 1970 UTC) to NTP timestamp array.
 * @param {number} seconds The unix timestamp in seconds.
 * @returns {number[]} The NTP timestamp array.
 */
export function timestampToTimetag(seconds: number): Timetag {
  const wholeSecs: number = Math.floor(seconds);
  const fracSeconds: number = seconds - wholeSecs;
  return makeTimetag(wholeSecs, fracSeconds);
}
