import {
  addressTransform,
  applyTransform,
  fromOscPacket,
  messageTransform,
  toOscPacket,
} from "src/osc-utilities";
import type {
  OscBundle,
  OscMessage,
  TransformAddress,
  TransformMessage,
} from "src/types";

export function fromBuffer(
  buffer: Buffer,
  strict: boolean = false,
): OscMessage | OscBundle {
  if (buffer instanceof ArrayBuffer) {
    buffer = Buffer.from(new Uint8Array(buffer));
  } else if (buffer instanceof Uint8Array) {
    buffer = Buffer.from(buffer);
  }
  return fromOscPacket(buffer, strict);
}

export function toBuffer(
  object: any,
  strict: boolean = false,
  opt?: any,
): Buffer {
  if (typeof object === "string")
    return toOscPacket({ address: object, args: strict }, opt);
  return toOscPacket(object, strict);
}

export function applyAddressTransform(
  buffer: Buffer,
  transform: TransformAddress,
): Buffer {
  return applyTransform(buffer, addressTransform(transform));
}

export function applyMessageTransform(
  buffer: Buffer,
  transform: TransformMessage,
): Buffer {
  return applyTransform(buffer, messageTransform(transform));
}

export * from "src/osc-utilities";
