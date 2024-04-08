import { ntpToFractionalSeconds } from "src/osc-utilities";
import { UNIX_EPOCH } from "src/common";
import type { Timetag } from "src/types";

/**
 * Convert a timetag to unix timestamp (seconds since unix epoch).
 *
 * @param timetag - The timetag to convert.
 * @returns The unix timestamp in seconds.
 */
export function timetagToTimestamp(timetag: Timetag): number {
  const seconds = timetag[0] + ntpToFractionalSeconds(timetag[1]);
  return seconds - UNIX_EPOCH;
}
