import { describe, expect, it } from "vitest";
import {
  toOscString,
  splitOscString,
  concat,
  toIntegerBuffer,
  splitInteger,
  splitOscArgument,
  fromOscMessage,
  toTimetagBuffer,
  fromOscBundle,
  type OscMessage,
  toOscMessage,
  toOscArgument,
  toOscBundle,
  type OscBundle,
  applyTransform,
  toOscPacket,
  fromOscPacket,
  applyMessageTransformerToBundle,
  addressTransform,
  messageTransform,
  deltaTimetag,
  dateToTimetag,
  timetagToDate,
  timestampToTimetag,
  timetagToTimestamp,
  splitTimetag,
} from "src";
import type { Arg, ArgType, Timetag } from "src/types";
import { isArgType } from "src/helpers";

type TestData = { string: string; expectedLength: number };

function testString(string: string, expectedLength: number): TestData {
  return {
    string,
    expectedLength,
  };
}

function testStringRoundTrip(string: string, strict: boolean | undefined) {
  const oscString = toOscString(string);
  const { string: returnString } = splitOscString(oscString, strict);
  expect(string).toBe(returnString);
}

const testData: TestData[] = [
  testString("abc", 4),
  testString("abcd", 8),
  testString("abcde", 8),
  testString("abcdef", 8),
  testString("abcdefg", 8),
];

describe("toOscString", () => {
  describe("basic strings length", () => {
    testData.forEach(({ string, expectedLength }) => {
      it(string, () => {
        expect(toOscString(string).length).toBe(expectedLength);
      });
    });
  });

  describe("basic strings round trip", () => {
    testData.forEach(({ string, expectedLength }) => {
      it(string, () => {
        testStringRoundTrip(string, true);
      });
    });
  });

  it("non strings fail", () => {
    expect(() => toOscString(7 as any)).toThrowError();
  });

  it("strings with null characters don't fail by default", () => {
    expect(toOscString("\u0000")).not.toBeNull();
  });

  it("strict fails for strings with null characters", () => {
    expect(() => toOscString("\u0000", true)).toThrowError();
  });
});

describe("splitOscString", () => {
  it("strict fails for osc buffers with no null characters", () => {
    expect(() => splitOscString(Buffer.from("abc"), true)).toThrowError();
  });
});

describe("fromOscString", () => {
  it(
    "strict fails for osc buffers with non-null characters after a null character",
    { todo: true },
    () => {
      expect(() =>
        fromOscString(Buffer.from("abc\u0000abcd") as any, true),
      ).toThrowError();
    },
  );

  describe("strict passes for basic strings", () => {
    testData.forEach(({ string }) => {
      it(string, () => {
        testStringRoundTrip(string, true);
      });
    });
  });

  it(
    "strict fails for osc buffers with non-four length",
    { todo: true },
    () => {
      expect(() =>
        fromOscString(Buffer.from("abcd\u0000\u0000"), true),
      ).toThrowError();
    },
  );
});

describe("splitOscString", () => {
  it("throws when passed a non-buffer", () => {
    expect(() => splitOscString("test" as any)).toThrowError();
  });

  it("input string matches output string", () => {
    const { rest, string } = splitOscString(toOscString("testing it"));
    expect(string).toBe("testing it");
    expect(rest.length).toBe(0);
  });

  it("works with an over-allocated buffer", () => {
    const buffer = toOscString("testing it");
    const overAllocated = Buffer.alloc(16);
    buffer.copy(overAllocated);
    const { rest, string } = splitOscString(overAllocated);
    expect(string).toBe("testing it");
    expect(rest.length).toBe(4);
  });

  it("works with just a string by default", () => {
    const { rest, string } = splitOscString(Buffer.from("testing it"));
    expect(string).toBe("testing it");
    expect(rest.length).toBe(0);
  });

  it("strict fails for just a string", () => {
    expect(() =>
      splitOscString(Buffer.from("testing it"), true),
    ).toThrowError();
  });

  it("strict fails for string with not enough padding", () => {
    expect(() =>
      splitOscString(Buffer.from("testing \u0000\u0000"), true),
    ).toThrowError();
  });

  it("strict fails for string with not enough padding", () => {
    const { rest, string } = splitOscString(
      Buffer.from("testing it\u0000\u0000aaaa"),
      true,
    );
    expect(string).toBe("testing it");
    expect(rest.length).toBe(4);
  });

  it("strict fails for string with invalid padding", () => {
    expect(() =>
      splitOscString(Buffer.from("testing it\u0000aaaaa"), true),
    ).toThrowError();
  });
});

describe("concat", () => {
  it("throws when passed a single buffer", () => {
    expect(() => concat(Buffer.from("test") as any)).toThrowError();
  });

  it("throws when passed an array of non-buffers", () => {
    expect(() => concat(["bleh"] as any)).toThrowError();
  });
});

describe("toIntegerBuffer", () => {
  it("throws when passed a non-number", () => {
    expect(() => toIntegerBuffer("abcdefg" as any)).toThrowError();
  });
});

describe("splitInteger", () => {
  it("fails when sent a buffer that's too small", () => {
    expect(() => splitInteger(Buffer.alloc(3), "Int32")).toThrowError();
  });
});

describe("splitOscArgument", () => {
  it("fails when given a bogus type", () => {
    expect(() => splitOscArgument(Buffer.alloc(8), "bogus")).toThrowError();
  });
});

describe("fromOscMessage", () => {
  it("no type string works", () => {
    const oscAddress = toOscString("/stuff");
    const { address, args } = fromOscMessage(oscAddress);
    expect(address).toBe("/stuff");
    expect(args).toEqual([]);
  });

  it("type string and no args works", () => {
    const oscAddress = toOscString("/stuff");
    const oscType = toOscString(",");
    const oscMessage = Buffer.alloc(oscAddress.length + oscType.length);
    oscAddress.copy(oscMessage);
    oscType.copy(oscMessage, oscAddress.length);
    const { address, args } = fromOscMessage(oscMessage);
    expect(address).toBe("/stuff");
    expect(args).toEqual([]);
  });

  it("string argument works", () => {
    const oscAddress = toOscString("/stuff");
    const oscType = toOscString(",s");
    const oscArg = toOscString("argu");
    const translate = fromOscMessage(concat([oscAddress, oscType, oscArg]));
    const { address, args } = translate;
    const [argument1] = args as ArgType[];
    expect(address).toBe("/stuff");
    if (isArgType(argument1)) {
      expect(argument1.type).toBe("string");
      expect(argument1.value).toBe("argu");
    }
  });

  it("true argument works", () => {
    const oscAddress = toOscString("/stuff");
    const oscType = toOscString(",T");
    const { address, args } = fromOscMessage(concat([oscAddress, oscType]));
    expect(address).toBe("/stuff");
    const [argument1] = args as ArgType[];
    expect(isArgType(argument1)).toBe(true);
    if (isArgType(argument1)) {
      expect(argument1.type).toBe("true");
      expect(argument1.value).toBe(true);
    }
  });

  it("false argument works", () => {
    const oscAddress = toOscString("/stuff");
    const oscType = toOscString(",F");
    const translate = fromOscMessage(concat([oscAddress, oscType]));
    const { address, args } = translate;
    expect(address).toBe("/stuff");
    const [argument1] = args as ArgType[];
    expect(isArgType(argument1)).toBe(true);
    if (isArgType(argument1)) {
      expect(argument1.type).toBe("false");
      expect(argument1.value).toBe(false);
    }
  });

  it("null argument works", () => {
    const oscAddress = toOscString("/stuff");
    const oscType = toOscString(",N");
    const translate = fromOscMessage(concat([oscAddress, oscType]));
    const { address, args } = translate;
    expect(address).toBe("/stuff");
    const [argument1] = args as ArgType[];
    expect(isArgType(argument1)).toBe(true);
    if (isArgType(argument1)) {
      expect(argument1.type).toBe("null");
      expect(argument1.value).toBe(null);
    }
  });

  it("bang argument works", () => {
    const oscAddress = toOscString("/stuff");
    const oscType = toOscString(",I");
    const { address, args } = fromOscMessage(concat([oscAddress, oscType]));
    expect(address).toBe("/stuff");
    const [argument1] = args as ArgType[];
    expect(isArgType(argument1)).toBe(true);
    if (isArgType(argument1)) {
      expect(argument1.type).toBe("bang");
      expect(argument1.value).toBe("bang");
    }
  });

  it("blob argument works", () => {
    const oscAddress = toOscString("/stuff");
    const oscType = toOscString(",b");
    const oscArg = concat([toIntegerBuffer(4), Buffer.from("argu")]);
    const { address, args } = fromOscMessage(
      concat([oscAddress, oscType, oscArg]),
    );
    expect(address).toBe("/stuff");
    const [argument1] = args as ArgType[];
    expect(isArgType(argument1)).toBe(true);
    if (isArgType(argument1)) {
      expect(argument1.type).toBe("blob");
      if (argument1.type === "blob") {
        expect(argument1.value.toString("utf-8")).toBe("argu");
      }
    }
  });

  it("integer argument works", () => {
    const oscAddress = toOscString("/stuff");
    const oscType = toOscString(",i");
    const oscArg = toIntegerBuffer(888);
    const { address, args } = fromOscMessage(
      concat([oscAddress, oscType, oscArg]),
    );
    expect(address).toBe("/stuff");
    const [argument1] = args as ArgType[];
    expect(isArgType(argument1)).toBe(true);
    if (isArgType(argument1)) {
      expect(argument1.type).toBe("integer");
      expect(argument1.value).toBe(888);
    }
  });

  it("timetag argument works", () => {
    const oscAddress = toOscString("/stuff");
    const oscType = toOscString(",t");
    const timetag: Timetag = [8888, 9999];
    const oscArg = toTimetagBuffer(timetag);
    const { address, args } = fromOscMessage(
      concat([oscAddress, oscType, oscArg]),
    );
    expect(address).toBe("/stuff");
    const [argument1] = args as ArgType[];
    expect(isArgType(argument1)).toBe(true);
    if (isArgType(argument1)) {
      expect(argument1.type).toBe("timetag");
      expect(argument1.value).toEqual(timetag);
    }
  });

  it("mismatched array doesn't throw", () => {
    const oscAddress = toOscString("/stuff");
    expect(() =>
      fromOscMessage(concat([oscAddress, toOscString(",[")])),
    ).not.toThrow();
    expect(() =>
      fromOscMessage(concat([oscAddress, toOscString(",]")])),
    ).not.toThrow();
  });

  it("mismatched array throws in strict", () => {
    const oscAddress = toOscString("/stuff");
    expect(() =>
      fromOscMessage(concat([oscAddress, toOscString(",[", true)]), true),
    ).toThrow();
    expect(() =>
      fromOscMessage(concat([oscAddress, toOscString(",]", true)]), true),
    ).toThrow();
  });

  it("empty array argument works", () => {
    const oscAddress = toOscString("/stuff");
    const oscType = toOscString(",[]");
    const { address, args } = fromOscMessage(concat([oscAddress, oscType]));
    expect(address).toBe("/stuff");
    const [argument1] = args as ArgType[];
    expect(isArgType(argument1)).toBe(true);
    if (isArgType(argument1)) {
      expect(argument1.type).toBe("array");
      expect((argument1.value as ArgType[]).length).toBe(0);
      expect(argument1.value).toEqual([]);
    }
  });

  it("bang array argument works", () => {
    const oscAddress = toOscString("/stuff");
    const oscType = toOscString(",[I]");
    const { address, args } = fromOscMessage(concat([oscAddress, oscType]));
    expect(address).toBe("/stuff");
    const [argument1] = args as ArgType[];
    expect(isArgType(argument1)).toBe(true);
    if (isArgType(argument1)) {
      expect(argument1.type).toBe("array");
      if (argument1.type === "array") {
        expect(argument1.value.length).toBe(1);
        expect((argument1.value[0] as ArgType).type).toBe("bang");
        expect((argument1.value[0] as ArgType).value).toBe("bang");
      }
    }
  });

  it("string array argument works", () => {
    const oscAddress = toOscString("/stuff");
    const oscType = toOscString(",[s]");
    const oscArg = toOscString("argu");
    const { address, args } = fromOscMessage(
      concat([oscAddress, oscType, oscArg]),
    );
    expect(address).toBe("/stuff");
    const [argument1] = args as ArgType[];
    expect(isArgType(argument1)).toBe(true);
    if (isArgType(argument1)) {
      expect(argument1.type).toBe("array");
      if (argument1.type === "array") {
        expect(argument1.value.length).toBe(1);
        expect((argument1.value[0] as ArgType).type).toBe("string");
        expect((argument1.value[0] as ArgType).value).toBe("argu");
      }
    }
  });

  it("nested array argument works", () => {
    const oscAddress = toOscString("/stuff");
    const oscType = toOscString(",[[I]]");
    const { address, args } = fromOscMessage(concat([oscAddress, oscType]));
    expect(address).toBe("/stuff");
    const [argument1] = args as ArgType[];
    expect(isArgType(argument1)).toBe(true);
    if (isArgType(argument1)) {
      expect(argument1.type).toBe("array");
      if (argument1.type === "array") {
        expect(argument1.value.length).toBe(1);
        expect(argument1.value[0]?.type).toBe("array");
        if (argument1.value[0]?.type === "array") {
          expect(argument1.value[0].value.length).toBe(1);
          expect(argument1.value[0].value[0]?.type).toBe("bang");
          expect(argument1.value[0].value[0]?.value).toBe("bang");
        }
      }
    }
  });

  it("multiple args works", () => {
    const oscAddress = toOscString("/stuff");
    const oscType = toOscString(",sbi");
    const oscArg = concat([
      toOscString("argu"),
      concat([toIntegerBuffer(4), Buffer.from("argu")]),
      toIntegerBuffer(888),
    ]);
    const { address, args } = fromOscMessage(
      concat([oscAddress, oscType, oscArg]),
    );
    expect(address).toBe("/stuff");
    const [argument1] = args as ArgType[];
    expect(isArgType(argument1)).toBe(true);
    if (isArgType(argument1)) {
      expect(argument1.type).toBe("string");
      expect(argument1.value).toBe("argu");
    }
  });

  it("strict fails if type string has no comma", () => {
    const oscAddress = toOscString("/stuff");
    const oscType = toOscString("fake");
    const oscMessage = concat([oscAddress, oscType]);
    expect(() => fromOscMessage(oscMessage, true)).toThrowError();
  });

  it("non-strict works if type string has no comma", () => {
    const oscAddress = toOscString("/stuff");
    const oscType = toOscString("fake");
    const { address, args } = fromOscMessage(concat([oscAddress, oscType]));
    expect(address).toBe("/stuff");
    expect((args as ArgType[]).length).toBe(0);
  });

  it("strict fails if type address doesn't begin with /", () => {
    const oscAddress = toOscString("stuff");
    const oscType = toOscString(",");
    const oscMessage = concat([oscAddress, oscType]);
    expect(() => fromOscMessage(oscMessage, true)).toThrowError();
  });
});

describe("fromOscBundle", () => {
  it("works with no messages", () => {
    const oscBundle = toOscString("#bundle");
    const inputTimetag: Timetag = [0, 0];
    const oscTimetag = toTimetagBuffer(inputTimetag);
    const buffer = concat([oscBundle, oscTimetag]);
    const { elements, timetag } = fromOscBundle(buffer);
    expect(timetag).toEqual(inputTimetag);
    expect(elements).toEqual([]);
  });

  it("works with single message", () => {
    const oscBundle = toOscString("#bundle");
    const inputTimetag: Timetag = [0, 0];
    const oscTimetag = toTimetagBuffer(inputTimetag);
    const oscAddress = toOscString("/addr");
    const oscType = toOscString(",");
    const oscMessage = concat([oscAddress, oscType]);
    const oscLength = toIntegerBuffer(oscMessage.length);
    const buffer = concat([oscBundle, oscTimetag, oscLength, oscMessage]);
    const { elements, timetag } = fromOscBundle(buffer);
    expect(timetag).toEqual(inputTimetag);
    expect(elements.length).toBe(1);
    expect(elements[0]?.oscType).toBe("message");
    if (elements[0]?.oscType === "message") {
      expect(elements[0].address).toBe("/addr");
    }
  });

  it("works with multiple messages", () => {
    const oscBundle = toOscString("#bundle");
    const inputTimetag: Timetag = [0, 0];
    const oscTimetag = toTimetagBuffer(inputTimetag);
    const oscAddress1 = toOscString("/addr1");
    const oscType1 = toOscString(",");
    const oscMessage1 = concat([oscAddress1, oscType1]);
    const oscLength1 = toIntegerBuffer(oscMessage1.length);
    const oscAddress2 = toOscString("/addr2");
    const oscType2 = toOscString(",");
    const oscMessage2 = concat([oscAddress2, oscType2]);
    const oscLength2 = toIntegerBuffer(oscMessage2.length);
    const buffer = concat([
      oscBundle,
      oscTimetag,
      oscLength1,
      oscMessage1,
      oscLength2,
      oscMessage2,
    ]);
    const { elements, timetag } = fromOscBundle(buffer);
    expect(timetag).toEqual(inputTimetag);
    expect(elements.length).toBe(2);
    const [element1, element2] = elements;
    expect(element1?.oscType).toBe("message");
    if (element1?.oscType === "message") {
      expect(element1.address).toBe("/addr1");
    }
    expect(element2?.oscType).toBe("message");
    if (element2?.oscType === "message") {
      expect(element2.address).toBe("/addr2");
    }
  });

  it("works with nested bundles", () => {
    const oscBundle1 = toOscString("#bundle");
    const timetag1: Timetag = [0, 0];
    const oscTimetag1 = toTimetagBuffer(timetag1);
    const oscAddress1 = toOscString("/addr");
    const oscType1 = toOscString(",");
    const oscMessage1 = concat([oscAddress1, oscType1]);
    const oscLength1 = toIntegerBuffer(oscMessage1.length);
    const oscBundle2 = toOscString("#bundle");
    const timetag2: Timetag = [0, 0];
    const oscTimetag2 = toTimetagBuffer(timetag2);
    const oscMessage2 = concat([oscBundle2, oscTimetag2]);
    const oscLength2 = toIntegerBuffer(oscMessage2.length);
    const buffer = concat([
      oscBundle1,
      oscTimetag1,
      oscLength1,
      oscMessage1,
      oscLength2,
      oscMessage2,
    ]);
    const { elements, timetag } = fromOscBundle(buffer);
    expect(timetag).toEqual(timetag1);
    expect(elements.length).toBe(2);
    const [element1, element2] = elements;
    expect(element1?.oscType).toBe("message");
    if (element1?.oscType === "message") {
      expect(element1.address).toBe("/addr");
    }
    expect(element2?.oscType).toBe("bundle");
    if (element2?.oscType === "bundle") {
      expect(element2.timetag).toEqual(timetag2);
    }
  });

  it("works with non-understood messages", () => {
    const oscBundle = toOscString("#bundle");
    const inputTimetag: Timetag = [0, 0];
    const oscTimetag = toTimetagBuffer(inputTimetag);
    const oscAddress1 = toOscString("/addr1");
    const oscType1 = toOscString(",");
    const oscMessage1 = concat([oscAddress1, oscType1]);
    const oscLength1 = toIntegerBuffer(oscMessage1.length);
    const oscAddress2 = toOscString("/addr2");
    const oscType2 = toOscString(",a");
    const oscMessage2 = concat([oscAddress2, oscType2]);
    const oscLength2 = toIntegerBuffer(oscMessage2.length);
    const buffer = concat([
      oscBundle,
      oscTimetag,
      oscLength1,
      oscMessage1,
      oscLength2,
      oscMessage2,
    ]);
    const { elements, timetag } = fromOscBundle(buffer);
    expect(timetag).toEqual(inputTimetag);
    expect(elements.length).toBe(1);
    const [element1] = elements;
    expect(element1?.oscType).toBe("message");
    if (element1?.oscType === "message") {
      expect(element1.address).toBe("/addr1");
    }
  });

  it("fails with bad bundle ID", () => {
    const oscBundle = toOscString("#blunder");
    const inputTimetag: Timetag = [0, 0];
    const oscTimetag = toTimetagBuffer(inputTimetag);
    const buffer = concat([oscBundle, oscTimetag]);
    expect(() => fromOscBundle(buffer)).toThrow();
  });

  it("fails with ridiculous sizes", () => {
    const oscBundle = toOscString("#bundle");
    const inputTimetag: Timetag = [0, 0];
    const oscTimetag = toTimetagBuffer(inputTimetag);
    const oscFakeLength = toIntegerBuffer(999999);
    const buffer = concat([oscBundle, oscTimetag, oscFakeLength]);
    expect(() => fromOscBundle(buffer)).toThrow();
  });
});

// We tested fromOsc* manually, so just use roundtrip testing for toOsc*
describe("toOscArgument", () => {
  it("fails when given bogus type", () => {
    expect(() => toOscArgument("bleh", "bogus")).toThrowError();
  });
});

function roundTripMessage(args: Arg[]): void {
  const oscMessage: OscMessage = {
    address: "/addr",
    args: args,
  };

  const roundTrip = fromOscMessage(toOscMessage(oscMessage), true);

  expect(roundTrip.address).toBe("/addr");
  expect((roundTrip.args as ArgType[]).length).toBe((args as ArgType[]).length);

  args.forEach((arg, argIndex) => {
    if (isArgType(arg)) {
      const comparison = arg.value ?? arg;

      if (Buffer.isBuffer(comparison)) {
        comparison.forEach((byte, byteIndex) => {
          const bufferArgument = (roundTrip.args as ArgType[])[argIndex];
          expect(isArgType(bufferArgument)).toBe(true);
          if (isArgType(bufferArgument)) {
            expect((bufferArgument.value as ArgType[])[byteIndex]).toEqual(
              byte,
            );
          }
        });
      } else {
        expect(isArgType((roundTrip.args as ArgType[])[argIndex])).toBe(true);
        expect(
          ((roundTrip.args as ArgType[])[argIndex] as ArgType).value,
        ).toEqual(comparison);
      }
    }
  });
}

function bufferEquals(buffer: Buffer, expectedBuffer: Buffer) {
  expect(buffer.length).toBe(expectedBuffer.length);
  buffer.forEach((byte, index) => {
    expect(byte).toBe(expectedBuffer[index]);
  });
}

function toOscMessageThrowsHelper(arg: Arg) {
  expect(() => toOscMessage({ address: "/addr", args: [arg] })).toThrowError();
}

describe("toOscMessage", () => {
  it("no args works", () => roundTripMessage([]));

  it("strict with null argument throws", () =>
    expect(() =>
      toOscMessage({ address: "/addr", args: [null] }, true),
    ).toThrowError());

  it("string argument works", () => roundTripMessage(["strr"]));

  it("empty array argument works", () => roundTripMessage([[]]));

  it("array value works", () =>
    roundTripMessage([{ type: "array", value: [] }]));

  it("string array argument works", () =>
    roundTripMessage([
      [
        { type: "string", value: "hello" },
        { type: "string", value: "goodbye" },
      ],
    ]));

  it("multi-type array argument works", () =>
    roundTripMessage([
      [
        { type: "string", value: "hello" },
        { type: "integer", value: 7 },
      ],
    ]));

  it("nested array argument works", () =>
    roundTripMessage([
      [{ type: "array", value: [{ type: "string", value: "hello" }] }],
    ]));

  it("bad layout works", () => {
    const oscMessage: OscMessage = {
      address: "/addr",
      args: ["strr"],
    };
    const { address, args } = fromOscMessage(toOscMessage(oscMessage), true);
    expect(address).toBe("/addr");
    expect((args as ArgType[]).length).toBe(1);
    expect(((args as ArgType[])[0] as ArgType).value).toBe("strr");
  });

  it("single numeric argument works", () => {
    const oscMessage: OscMessage = {
      address: "/addr",
      args: 13,
    };
    const { address, args } = fromOscMessage(toOscMessage(oscMessage), true);
    expect(address).toBe("/addr");
    expect((args as ArgType[]).length).toBe(1);
    expect(((args as ArgType[])[0] as ArgType).type).toBe("float");
    expect(((args as ArgType[])[0] as ArgType).value).toBe(13);
  });

  it("single blob argument works", () => {
    const buffer = Buffer.alloc(18);
    const oscMessage: OscMessage = {
      address: "/addr",
      args: buffer,
    };
    const { address, args } = fromOscMessage(toOscMessage(oscMessage), true);
    expect(address).toBe("/addr");
    const [argument1] = args as ArgType[];
    expect((args as ArgType[]).length).toBe(1);
    expect(argument1?.type).toBe("blob");
    if (argument1?.type === "blob") {
      bufferEquals(argument1?.value, buffer);
    }
  });

  it("single string argument works", () => {
    const oscMessage: OscMessage = {
      address: "/addr",
      args: "strr",
    };
    const { address, args } = fromOscMessage(toOscMessage(oscMessage), true);
    expect(address).toBe("/addr");
    expect((args as ArgType[]).length).toBe(1);
    expect(((args as ArgType[])[0] as ArgType).type).toBe("string");
    expect(((args as ArgType[])[0] as ArgType).value).toBe("strr");
  });

  it("integer argument works", () => {
    roundTripMessage([8]);
  });

  it("buffer argument works", () => {
    // Buffer will have random contents, but that's okay
    roundTripMessage([Buffer.alloc(16)]);
  });

  it("strict with type true and value false throws", () => {
    expect(() =>
      toOscMessage(
        { address: "/addr/", args: { type: "false", value: true as false } },
        true,
      ),
    ).toThrowError();
  });

  it("strict with type false with value true throws", () => {
    expect(() =>
      toOscMessage(
        { address: "/addr/", args: { type: "true", value: false as true } },
        true,
      ),
    ).toThrowError();
  });

  it("type true works", () => {
    const { args } = fromOscMessage(
      toOscMessage({ address: "/addr", args: true }),
    );
    expect((args as ArgType[]).length).toBe(1);
    expect((args as ArgType[])[0]?.type).toBe("true");
    expect((args as ArgType[])[0]?.value).toBe(true);
  });

  it("type false works", () => {
    const { args } = fromOscMessage(
      toOscMessage({ address: "/addr", args: false }),
    );
    expect((args as ArgType[]).length).toBe(1);
    expect((args as ArgType[])[0]?.type).toBe("false");
    expect((args as ArgType[])[0]?.value).toBe(false);
  });

  it("type bang argument works", () => {
    const { args } = fromOscMessage(
      toOscMessage({ address: "/addr", args: { type: "bang", value: "bang" } }),
    );
    expect((args as ArgType[]).length).toBe(1);
    expect((args as ArgType[])[0]?.type).toBe("bang");
    expect((args as ArgType[])[0]?.value).toBe("bang");
  });

  it("type timetag argument works", () => {
    roundTripMessage([{ type: "timetag", value: [8888, 9999] }]);
  });

  it("type double argument works", () => {
    roundTripMessage([{ type: "double", value: 8888 }]);
  });

  it("strict with type null with value true throws", () => {
    expect(() =>
      toOscMessage(
        {
          address: "/addr/",
          args: { type: "null", value: true as unknown as null },
        },
        true,
      ),
    ).toThrowError();
  });

  it("type null works", () => {
    const { args } = fromOscMessage(
      toOscMessage({ address: "/addr", args: null }),
    );
    expect((args as ArgType[]).length).toBe(1);
    expect((args as ArgType[])[0]?.type).toBe("null");
    expect((args as ArgType[])[0]?.value).toBe(null);
  });

  it("float argument works", () => {
    roundTripMessage([{ type: "float", value: 6 }]);
  });

  it("just a string works", () => {
    const { address, args } = fromOscMessage(toOscMessage("bleh" as any));
    expect((args as ArgType[]).length).toBe(0);
    expect(address).toBe("bleh");
  });

  it("bad layout works", () => {
    const oscMessage: OscMessage = {
      address: "/addr",
      args: ["strr"],
    };
    const { address, args } = fromOscMessage(toOscMessage(oscMessage), true);
    expect(address).toBe("/addr");
    expect((args as ArgType[]).length).toBe(1);
    expect(((args as ArgType[])[0] as ArgType).value).toBe("strr");
  });

  it("single numeric argument works", () => {
    const oscMessage: OscMessage = {
      address: "/addr",
      args: 13,
    };
    const { address, args } = fromOscMessage(toOscMessage(oscMessage), true);
    expect(address).toBe("/addr");
    expect((args as ArgType[]).length).toBe(1);
    expect(((args as ArgType[])[0] as ArgType).type).toBe("float");
    expect(((args as ArgType[])[0] as ArgType).value).toBe(13);
  });

  it("single blob argument works", () => {
    const buffer = Buffer.alloc(18);
    const oscMessage: OscMessage = {
      address: "/addr",
      args: buffer,
    };
    const { address, args } = fromOscMessage(toOscMessage(oscMessage), true);
    expect(address).toBe("/addr");
    const [argument1] = args as ArgType[];
    expect((args as ArgType[]).length).toBe(1);
    expect(argument1?.type).toBe("blob");
    if (argument1?.type === "blob") {
      bufferEquals(argument1?.value, buffer);
    }
  });

  it("single string argument works", () => {
    const oscMessage: OscMessage = {
      address: "/addr",
      args: "strr",
    };
    const { address, args } = fromOscMessage(toOscMessage(oscMessage), true);
    expect(address).toBe("/addr");
    expect((args as ArgType[]).length).toBe(1);
    expect(((args as ArgType[])[0] as ArgType).type).toBe("string");
    expect(((args as ArgType[])[0] as ArgType).value).toBe("strr");
  });

  it("integer argument works", () => {
    roundTripMessage([8]);
  });

  it("buffer argument works", () => {
    // Buffer will have random contents, but that's okay
    roundTripMessage([Buffer.alloc(16)]);
  });

  it("strict with type true and value false throws", () => {
    expect(() =>
      toOscMessage(
        { address: "/addr/", args: { type: "false", value: true as false } },
        true,
      ),
    ).toThrowError();
  });

  it("strict with type false with value true throws", () => {
    expect(() =>
      toOscMessage(
        { address: "/addr/", args: { type: "true", value: false as true } },
        true,
      ),
    ).toThrowError();
  });

  it("type true works", () => {
    const { args } = fromOscMessage(
      toOscMessage({ address: "/addr", args: true }),
    );
    expect((args as ArgType[]).length).toBe(1);
    expect((args as ArgType[])[0]?.type).toBe("true");
    expect((args as ArgType[])[0]?.value).toBe(true);
  });

  it("type false works", () => {
    const { args } = fromOscMessage(
      toOscMessage({ address: "/addr", args: false }),
    );
    expect((args as ArgType[]).length).toBe(1);
    expect((args as ArgType[])[0]?.type).toBe("false");
    expect((args as ArgType[])[0]?.value).toBe(false);
  });

  it("type bang argument works", () => {
    const { args } = fromOscMessage(
      toOscMessage({ address: "/addr", args: { type: "bang", value: "bang" } }),
    );
    expect((args as ArgType[]).length).toBe(1);
    expect((args as ArgType[])[0]?.type).toBe("bang");
    expect((args as ArgType[])[0]?.value).toBe("bang");
  });

  it("type timetag argument works", () => {
    roundTripMessage([{ type: "timetag", value: [8888, 9999] }]);
  });

  it("type double argument works", () => {
    roundTripMessage([{ type: "double", value: 8888 }]);
  });

  it("strict with type null with value true throws", () => {
    expect(() =>
      toOscMessage(
        {
          address: "/addr/",
          args: { type: "null", value: true as unknown as null },
        },
        true,
      ),
    ).toThrowError();
  });

  it("type null works", () => {
    const { args } = fromOscMessage(
      toOscMessage({ address: "/addr", args: null }),
    );
    expect((args as ArgType[]).length).toBe(1);
    expect((args as ArgType[])[0]?.type).toBe("null");
    expect((args as ArgType[])[0]?.value).toBe(null);
  });

  it("float argument works", () => {
    roundTripMessage([{ type: "float", value: 6 }]);
  });

  it("just a string works", () => {
    const { address, args } = fromOscMessage(toOscMessage("bleh"));
    expect((args as ArgType[]).length).toBe(0);
    expect(address).toBe("bleh");
  });

  it("multiple args works", () => {
    roundTripMessage(["str", 7, Buffer.alloc(30), 6]);
  });

  it("integer argument works", () => {
    roundTripMessage([{ value: 7, type: "integer" }]);
  });

  it("fails with no address", () => {
    expect(() => toOscMessage({ args: [] } as any)).toThrowError();
  });

  it("fails when string type is specified but wrong", () => {
    toOscMessageThrowsHelper({ value: 7, type: "string" as any });
  });

  it("fails when integer type is specified but wrong", () => {
    toOscMessageThrowsHelper({ value: "blah blah", type: "integer" as any });
  });

  it("fails when float type is specified but wrong", () => {
    toOscMessageThrowsHelper({ value: "blah blah", type: "float" as any });
  });

  it("fails when timetag type is specified but wrong", () => {
    toOscMessageThrowsHelper({ value: "blah blah", type: "timetag" as any });
  });

  it("fails when double type is specified but wrong", () => {
    toOscMessageThrowsHelper({ value: "blah blah", type: "double" as any });
  });

  it("fails argument is a random type", () => {
    toOscMessageThrowsHelper({
      random_field: 42,
      "is pretty random": 888,
    } as any);
  });
});

function roundTripBundle(bundleElements: (OscMessage | OscBundle)[]) {
  const oscMessage: OscBundle = {
    timetag: [0, 0],
    elements: bundleElements,
    oscType: "bundle",
  };

  const { elements, oscType, timetag } = fromOscBundle(
    toOscBundle(oscMessage),
    true,
  );

  expect(timetag).toEqual([0, 0]);

  const length = typeof bundleElements === "object" ? elements.length : 1;
  expect(elements.length).toBe(length);

  for (let i = 0; i < length; i++) {
    if (typeof bundleElements === "object") {
      expect((elements[i] as OscBundle).timetag).toEqual(
        (bundleElements[i] as OscBundle).timetag,
      );
      expect((elements[i] as OscMessage).address).toBe(
        (bundleElements[i] as OscMessage).address,
      );
    } else {
      expect((elements[i] as OscMessage).address).toBe(bundleElements);
    }
  }
}

describe("toOscBundle", () => {
  it("no elements works", () => {
    roundTripBundle([]);
  });

  it("just a string works", () => {
    roundTripBundle("/address");
  });

  it("just a number fails", () => {
    expect(() => roundTripBundle(78)).toThrowError();
  });

  it("one message works", () => {
    roundTripBundle([{ address: "/addr" }]);
  });

  it("nested bundles works", () => {
    roundTripBundle([{ address: "/addr" }, { timetag: [8888, 9999] }]);
  });

  it("bogus packets works", () => {
    const { elements, timetag } = fromOscBundle(
      toOscBundle({
        timetag: [0, 0],
        elements: [{ timetag: [0, 0] }, { maddress: "/addr" }],
      }),
    );
    expect(elements.length).toBe(1);
    expect(elements[0].timetag).toEqual([0, 0]);
  });

  it("strict fails without timetags", () => {
    expect(() => toOscBundle({ elements: [] }, true)).toThrowError();
  });
});

describe("applyTransform", () => {
  it("works with single message", () => {
    const testBuffer = toOscString("/message");
    expect(applyTransform(testBuffer, (a) => Buffer.alloc(0).length)).toBe(0);
  });

  it("works when explicitly set to bundle", () => {
    const testBuffer = toOscString("/message");
    expect(applyTransform(testBuffer, (a) => a)).toBe(testBuffer);
  });

  it("works with a simple bundle", { todo: true }, () => {
    const base: OscBundle = {
      timetag: [0, 0],
      elements: [{ address: "test1" }, { address: "test2" }],
      oscType: "bundle",
    };
    const transform = applyTransform(toOscPacket(base), (a) => a);
    const { elements, oscType, timetag } = fromOscPacket(
      transform,
    ) as OscBundle;
    expect(timetag).toEqual([0, 0]);
    expect(elements.length).toBe(base.elements.length);
    elements.forEach((element, index) => {
      expect((element as OscBundle)?.timetag).toBe(
        (base.elements[index] as OscBundle).timetag,
      );
      expect((element as OscMessage)?.address).toBe(
        (base.elements[index] as OscMessage).address,
      );
    });
  });
});

describe("toOscPacket", () => {
  it("works when explicitly set to bundle", () => {
    const { elements } = fromOscBundle(
      toOscPacket({ timetag: [0, 0], oscType: "bundle", elements: [] }, true), // TODO Deviation from original test on Timetag
    );
    expect(elements.length).toBe(0);
  });

  it("works when explicitly set to message", () => {
    const { address, args } = fromOscPacket(
      toOscPacket({ address: "/bleh", oscType: "message", args: [] }, true),
    ) as OscMessage;
    expect((args as Arg[]).length).toBe(0);
    expect(address).toBe("/bleh");
  });
});

describe("applyMessageTransformerToBundle", () => {
  it("fails on bundle without tag", () => {
    const func = applyMessageTransformerToBundle((a) => a);
    expect(() =>
      func(concat([toOscString("#grundle"), toIntegerBuffer(0, "Int64")])),
    ).toThrowError();
  });
});

describe("addressTransform", () => {
  it("works with identity", () => {
    const testBuffer = concat([
      toOscString("/message"),
      Buffer.from("gobblegobblewillsnever\u0000parse blah lbha"),
    ]);
    const transformed = applyTransform(
      testBuffer,
      addressTransform((a) => a),
    );
    testBuffer.forEach((byte, index) => {
      expect(transformed[index]).toBe(byte);
    });
  });

  it("works with bundles", { todo: true }, () => {
    const base: OscBundle = {
      timetag: [0, 0],
      elements: [{ address: "test1" }, { address: "test2" }],
    };
    const transformed = fromOscPacket(
      applyTransform(
        toOscPacket(base),
        addressTransform((a) => `/prelude/${a}`),
      ),
    ) as OscBundle; // Type assertion
    expect(transformed?.timetag).toEqual([0, 0]);
    expect(transformed?.elements.length).toBe(base.elements.length);
    base.elements.forEach((element, index) => {
      expect(transformed.elements[index].timetag).toEqual(element.timetag);
      expect(transformed.elements[index].address).toEqual(
        `/prelude/${element.address}`,
      );
    });
  });
});

describe("messageTransform", () => {
  it("works with identity function for single message", () => {
    const message: OscMessage = {
      address: "/addr",
      args: [],
    };
    const buffer = toOscPacket(message);
    bufferEquals(
      applyTransform(
        buffer,
        messageTransform((a) => a),
      ),
      buffer,
    );
  });

  it("works with bundles", { todo: true }, () => {
    const bundle: OscBundle = {
      timetag: [0, 0],
      elements: [{ address: "test1" }, { address: "test2" }],
    };
    const buffer = toOscPacket(bundle);
    bufferEquals(
      applyTransform(
        buffer,
        messageTransform((a) => a),
      ),
      buffer,
    );
  });
});

