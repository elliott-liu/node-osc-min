export type MakeTimetagResult = [number, number];

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
): MakeTimetagResult {
  // NTP epoch is 1900, JavaScript Date is Unix 1970
  const UNIX_EPOCH = 2208988800;
  const TWO_POW_32 = Math.pow(2, 32);

  // Calculate NTP seconds and fractions
  const ntpSeconds = unixTimestampSeconds + UNIX_EPOCH;
  const ntpFractions = Math.round(TWO_POW_32 * fractionalSeconds);

  return [ntpSeconds, ntpFractions];
}
