export type TransformMessage = (message: any) => any;

export type MessageTransform = {
  (buffer: Buffer): Buffer;
};

export type TransformAddress = (address: string) => string;
