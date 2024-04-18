import type { OscMessage, Timetag } from "src/types";

export type OscBundle = {
  timetag: Timetag;
  elements: (OscBundle | OscMessage)[];
  oscType: "bundle";
};
