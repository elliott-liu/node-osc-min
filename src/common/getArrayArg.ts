/**
 * Helper function to check if an argument represents an array.
 *
 * @param arg - The argument to check.
 * @returns The array if the argument represents an array, otherwise null.
 */
export function getArrayArg(arg: any): any[] | null {
  if (Array.isArray(arg)) {
    return arg;
  } else if (arg?.type === "array" && Array.isArray(arg?.value)) {
    return arg.value;
  } else if (arg && !arg.type && Array.isArray(arg.value)) {
    return arg.value;
  } else {
    return null;
  }
}
