import type { Timetag } from "src/types/Timetag";

export type Arg = ArgType | ArgValue;

export type ArgType =
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
    }
  | {
      type: "array";
      value: ArgType[];
    };

export type ArgRepresentation = Extract<ArgType, {}>["type"];
export type ArgValue = Extract<ArgType, {}>["value"];
