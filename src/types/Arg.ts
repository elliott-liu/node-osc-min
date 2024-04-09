import type { Timetag } from "src/types/Timetag";

export type Arg =
  | {
      type: "string";
      value: string;
    }
  | {
      type: "integer";
      value: number;
    }
  | {
      type: "timetag";
      value: Timetag;
    }
  | {
      type: "float";
      value: number;
    }
  | {
      type: "double";
      value: number;
    }
  | {
      type: "blob";
      value: Buffer;
    }
  | {
      type: "true";
      value: true;
    }
  | {
      type: "false";
      value: false;
    }
  | {
      type: "null";
      value: null;
    }
  | {
      type: "bang";
      value: "bang";
    };

export type ArgRepresentation = Extract<Arg, {}>["type"];
export type ArgValue = Extract<Arg, {}>["value"];

export type OscMessageArg =
  | Arg
  | {
      type: "array";
      value: OscMessageArg[] | undefined;
    };
