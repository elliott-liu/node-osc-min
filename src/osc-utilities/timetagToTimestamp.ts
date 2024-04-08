import { ntpToFractionalSeconds } from ".";
import { UNIX_EPOCH } from "../common";
import type { Timetag } from "../types";

/**
 * Convert a timetag to unix timestamp (seconds since unix epoch).
 *
 * @param {Timetag} timetag - The timetag to convert.
 * @returns {number} The unix timestamp in seconds.
 */
export function timetagToTimestamp(timetag: Timetag): number {
  const seconds = timetag[0] + ntpToFractionalSeconds(timetag[1]);
  return seconds - UNIX_EPOCH;
}
