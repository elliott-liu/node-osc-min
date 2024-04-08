import { timestampToTimetag } from "src/osc-utilities";

/**
 * Make NTP timestamp array for relative future: `now` + `seconds`.
 *
 * Accuracy of `now` limited to milliseconds but `seconds` may be a full `32 bit` float.
 * @param seconds - The number of seconds to add to the current timestamp.
 * @param now - The current timestamp (optional).
 * @returns The NTP timestamp array for the relative future.
 */
export function deltaTimetag(seconds: number, now?: number): number[] {
  const n = (now || Date.now()) / 1000;
  return timestampToTimetag(n + seconds);
}
