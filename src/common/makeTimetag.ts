import { TWO_POW_32, UNIX_EPOCH } from ".";
import type { Timetag } from "../types";

/**
 * Converts Unix timestamp and fractional seconds to NTP timetag format.
 *
 * @param {number} unixTimestampSeconds - The Unix timestamp in seconds.
 * @param {number} fractionalSeconds - The fractional seconds.
 * @returns {MakeTimetagResult} An array containing the NTP seconds and NTP fractions.
 */
export function makeTimetag(
  unixTimestampSeconds: number,
  fractionalSeconds: number,
): Timetag {
  // Calculate NTP seconds and fractions
  const ntpSeconds = unixTimestampSeconds + UNIX_EPOCH;
  const ntpFractions = Math.round(TWO_POW_32 * fractionalSeconds);

  return [ntpSeconds, ntpFractions];
}
