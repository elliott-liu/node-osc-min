import * as utils from "./osc-utilities";

export function fromBuffer(buffer: Buffer, strict?: boolean) {
  if (buffer instanceof ArrayBuffer) {
    buffer = Buffer.from(new Uint8Array(buffer));
  } else if (buffer instanceof Uint8Array) {
    buffer = Buffer.from(buffer);
  }
  return utils.fromOscPacket(buffer, strict);
}

export function toBuffer(object: any, strict?: boolean, opt?: any) {
  if (typeof object === "string")
    return utils.toOscPacket({ address: object, args: strict }, opt);
  return utils.toOscPacket(object, strict);
}

export function applyAddressTransform(
  buffer: Buffer,
  transform: (address: string) => string,
) {
  return utils.applyTransform(buffer, utils.addressTransform(transform));
}

export function applyMessageTransform(
  buffer: Buffer,
  transform: (message: any) => any,
) {
  return utils.applyTransform(buffer, utils.messageTransform(transform));
}

export const timetagToDate = utils.timetagToDate;
export const dateToTimetag = utils.dateToTimetag;
export const timetagToTimestamp = utils.timetagToTimestamp;
export const timestampToTimetag = utils.timestampToTimetag;
