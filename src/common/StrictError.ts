/**
 * An error that only throws when we're in strict mode.
 */
export class StrictError extends Error {
  /**
   * Creates a new instance of the StrictError class.
   * @param str - The error message.
   */
  constructor(str: string) {
    super("Strict Error: " + str);
    this.name = "StrictError";
  }
}
