import type { Arg } from "src/types";

export type OscMessage = {
  address: string;
  args: Args;
  oscType?: "message";
};

export type Args = Arg[] | Arg | undefined;
