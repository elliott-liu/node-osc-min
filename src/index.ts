import type {
  OscBundle,
  OscMessage,
  TransformAddress,
  TransformMessage,
} from "src/osc-utilities";
import * as utils from "src/osc-utilities";

export function fromBuffer(
  buffer: Buffer,
  strict: boolean = false,
): OscMessage | OscBundle {
  if (buffer instanceof ArrayBuffer) {
    buffer = Buffer.from(new Uint8Array(buffer));
  } else if (buffer instanceof Uint8Array) {
    buffer = Buffer.from(buffer);
  }
  return utils.fromOscPacket(buffer, strict);
}

export function toBuffer(
  object: any,
  strict: boolean = false,
  opt?: any,
): Buffer {
  if (typeof object === "string")
    return utils.toOscPacket({ address: object, args: strict }, opt);
  return utils.toOscPacket(object, strict);
}

export function applyAddressTransform(
  buffer: Buffer,
  transform: TransformAddress,
): Buffer {
  return utils.applyTransform(buffer, utils.addressTransform(transform));
}

export function applyMessageTransform(
  buffer: Buffer,
  transform: TransformMessage,
): Buffer {
  return utils.applyTransform(buffer, utils.messageTransform(transform));
}

export {
  timetagToDate,
  dateToTimetag,
  timetagToTimestamp,
  timestampToTimetag,
} from "src/osc-utilities";
