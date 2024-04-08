import { toOscTypeAndArgs } from "src/common";
import { concat, toOscString, type OscMessage } from "src/osc-utilities";

/**
 * Convert a JavaScript format message into an OSC buffer.
 *
 * @param message - The message to convert.
 * @param strict - Whether to enforce strict validation.
 * @returns The OSC message buffer.
 * @throws If the message is missing an address.
 */
export function toOscMessage(message: OscMessage, strict: boolean): Buffer {
  // The message must have an address
  const address = message?.address ?? message;
  if (typeof address !== "string") {
    throw new Error("Message must contain an address.");
  }

  let args: any[] = message?.args;
  if (args === undefined) {
    args = [];
  }

  // Pack single args
  if (!Array.isArray(args)) {
    const oldArg = args;
    args = [];
    args[0] = oldArg;
  }

  const oscAddr = toOscString(address, strict);
  const [oscType, oscArgs] = toOscTypeAndArgs(args, strict);
  const oscTypeTag = "," + oscType;

  // Bundle everything together
  const allArgs = concat(oscArgs);

  // Convert the type tag into an OSC string
  const oscTypeString = toOscString(oscTypeTag);

  return concat([oscAddr, oscTypeString, allArgs]);
}
