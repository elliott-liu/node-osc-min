import type { Arg, ArgType } from "src/types";

export function isArgType(arg: Arg): arg is ArgType {
  return (
    arg !== undefined &&
    arg !== null &&
    typeof arg === "object" &&
    "type" in arg
  );
}

export function isArgTypeArray(arg: Arg): arg is ArgType[] {
  return (
    arg !== undefined && arg !== null && isArgType(arg) && arg.type === "array"
  );
}
