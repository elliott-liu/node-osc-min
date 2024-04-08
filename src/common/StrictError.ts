/**
 * An error that only throws when we're in strict mode.
 */
export class StrictError extends Error {
  /**
   * Creates a new instance of the StrictError class.
   * @param string - The error message.
   */
  constructor(string: string) {
    super("Strict Error: " + string);
    this.name = "StrictError";
  }
}
