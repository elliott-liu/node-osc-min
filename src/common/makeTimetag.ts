import { TWO_POW_32, UNIX_EPOCH } from "src/common";
import type { Timetag } from "src/types";

/**
 * Converts Unix timestamp and fractional seconds to NTP timetag format.
 *
 * @param unixTimestampSeconds - The Unix timestamp in seconds.
 * @param fractionalSeconds - The fractional seconds.
 * @returns An array containing the NTP seconds and NTP fractions.
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
