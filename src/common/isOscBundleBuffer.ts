import { splitOscString } from "src/osc-utilities";

/**
 * Internal function to check if this is a message or bundle.
 *
 * @param buffer - The buffer to check.
 * @param strict - Whether to perform strict checking.
 * @returns `true` if the buffer represents a bundle, `false` otherwise.
 */
export function isOscBundleBuffer(
  buffer: Buffer,
  strict: boolean = false,
): boolean {
  // Both formats begin with strings, so we should just grab the front but not consume it.
  const { string } = splitOscString(buffer, strict);

  return string === "#bundle";
}
