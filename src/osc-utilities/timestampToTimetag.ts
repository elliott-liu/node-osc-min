import { makeTimetag } from "../common";

/**
 * Convert a unix timestamp (seconds since Jan 1 1970 UTC) to NTP timestamp array.
 * @param {number} secs The unix timestamp in seconds.
 * @returns {number[]} The NTP timestamp array.
 */
export function timestampToTimetag(secs: number): number[] {
  const wholeSecs: number = Math.floor(secs);
  const fracSeconds: number = secs - wholeSecs;
  return makeTimetag(wholeSecs, fracSeconds);
}
