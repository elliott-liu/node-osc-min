import { splitInteger } from "src/osc-utilities";

/**
 * Does something for each element in an array of osc-message-or-bundles, each prefixed by a length (such as appears in osc-messages), then return the result as an array.
 *
 * This is not exported because it doesn't validate the format and it's not really a generally useful function.
 *
 * If a function throws on an element, we discard that element in the map but we don't give up completely.
 *
 * @param buffer - The buffer containing the osc-message-or-bundles.
 * @param callback - The function to apply to each element.
 * @returns An array of results after applying the function to each element.
 */
export function mapBundleList<T>(
  buffer: Buffer,
  callback: (buffer: Buffer) => T,
): T[] {
  let elements: unknown[] = [];
  while (buffer.length) {
    let { integer: size, rest: remainingBuffer } = splitInteger(buffer);

    if (size > remainingBuffer.length) {
      throw new Error(
        "Invalid bundle list: size of element is bigger than buffer.",
      );
    }

    let thisElementBuffer = remainingBuffer.subarray(0, size);

    buffer = remainingBuffer.subarray(size);

    try {
      elements.push(callback(thisElementBuffer));
    } catch (e) {
      elements.push(null);
    }
  }

  let nonNullElements = elements.filter(
    (element): element is T => element !== null,
  );

  return nonNullElements;
}
