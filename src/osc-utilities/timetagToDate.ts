import { ntpToFractionalSeconds } from "src/osc-utilities";
import { UNIX_EPOCH } from "src/common";
import type { Timetag } from "src/types";

/**
 * Convert NTP timestamp array to a JavaScript Date in your system's local time zone.
 *
 * @param timetag - NTP timestamp array `[seconds, fractional]`.
 * @returns A JavaScript Date object in local time zone.
 */
export function timetagToDate(timetag: Timetag): Date {
  let [seconds, fractional] = timetag;
  seconds -= UNIX_EPOCH;

  const fracs = ntpToFractionalSeconds(fractional);
  const date = new Date();

  // Sets date to UTC/GMT
  date.setTime(seconds * 1000 + fracs * 1000);

  const localTimezoneDate = new Date();
  localTimezoneDate.setUTCFullYear(date.getUTCFullYear());
  localTimezoneDate.setUTCMonth(date.getUTCMonth());
  localTimezoneDate.setUTCDate(date.getUTCDate());
  localTimezoneDate.setUTCHours(date.getUTCHours());
  localTimezoneDate.setUTCMinutes(date.getUTCMinutes());
  localTimezoneDate.setUTCSeconds(date.getUTCSeconds());
  localTimezoneDate.setUTCMilliseconds(fracs * 1000);
  return localTimezoneDate;
}
