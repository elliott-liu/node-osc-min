import { TWO_POW_32 } from "src/common";

/**
 * Convert 32 bit int for NTP fractional seconds to a 32 bit float.
 *
 * @param {number} fractionalSeconds - NTP fractional seconds
 * @returns {number} JavaScript fractional seconds
 */
export function ntpToFractionalSeconds(fractionalSeconds: number): number {
  return parseFloat(fractionalSeconds.toString()) / TWO_POW_32;
}
