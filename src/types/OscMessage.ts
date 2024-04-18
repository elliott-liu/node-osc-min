import type { Arg } from "src/types";

export type OscMessage = {
  address: string;
  args: Arg[] | Arg;
  oscType?: "message";
};
