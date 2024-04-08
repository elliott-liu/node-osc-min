import { timestampToTimetag } from "src/osc-utilities";
import type { Timetag } from "src/types";

/**
 * Convert a JavaScript Date to a NTP timetag array.
 *
 * Time zone of the Date object is respected, as the NTP timetag uses UTC.
 *
 * @param {Date} date - The JavaScript Date object to convert.
 * @returns {number[]} The NTP timetag array.
 */
export function dateToTimetag(date: Date): Timetag {
  return timestampToTimetag(date.getTime() / 1000);
}
