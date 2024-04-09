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
  toOscArgument,
} from "src";
import type { Timetag } from "src/types";

type TestData = { string: string; expectedLength: number };

function testString(string: string, expectedLength: number): TestData {
  return {
    string,
    expectedLength,
  };
}

const testData: TestData[] = [
  testString("abc", 4),
  testString("abcd", 8),
  testString("abcde", 8),
  testString("abcdef", 8),
  testString("abcdefg", 8),
];

describe("basic strings length", () => {
  testData.forEach(({ string, expectedLength }) => {
    it(string, () => {
      expect(toOscString(string).length).toBe(expectedLength);
    });
  });
});

function testStringRoundTrip(string: string, strict: boolean | undefined) {
  const oscString = toOscString(string);
  const { string: returnString } = splitOscString(oscString, strict);
  expect(string).toBe(returnString);
}

describe("basic strings round trip", () => {
  testData.forEach(({ string, expectedLength }) => {
    it(string, () => {
      testStringRoundTrip(string, true);
    });
  });
});

it("non strings fail toOscString", () => {
  expect(() => toOscString(7 as any)).toThrowError();
});

it("strings with null characters don't fail toOscString by default", () => {
  expect(toOscString("\u0000")).not.toBeNull();
});

it("strings with null characters fail toOscString in strict mode", () => {
  expect(() => toOscString("\u0000", true)).toThrowError();
});

it("osc buffers with no null characters fail splitOscString in strict mode", () => {
  expect(() => splitOscString(Buffer.from("abc"), true)).toThrowError();
});

// it("osc buffers with non-null characters after a null character fail fromOscString in strict mode", () => {
//   expect(() =>
//     fromOscString(Buffer.from("abc\u0000abcd") as any, true),
//   ).toThrowError();
// });

describe("basic strings pass fromOscString in strict mode", () => {
  testData.forEach(({ string }) => {
    it(string, () => {
      testStringRoundTrip(string, true);
    });
  });
});

// it("osc buffers with non-four length fail in strict mode", () => {
//   expect(() =>
//     fromOscString(Buffer.from("abcd\u0000\u0000"), true),
//   ).toThrowError();
// });

it("splitOscString throws when passed a non-buffer", () => {
  expect(() => splitOscString("test" as any)).toThrowError();
});

it("splitOscString of an osc-string matches the string", () => {
  const { rest, string } = splitOscString(toOscString("testing it"));
  expect(string).toBe("testing it");
  expect(rest.length).toBe(0);
});

it("splitOscString works with an over-allocated buffer", () => {
  const buffer = toOscString("testing it");
  const overAllocated = Buffer.alloc(16);
  buffer.copy(overAllocated);
  const { rest, string } = splitOscString(overAllocated);
  expect(string).toBe("testing it");
  expect(rest.length).toBe(4);
});

it("splitOscString works with just a string by default", () => {
  const { rest, string } = splitOscString(Buffer.from("testing it"));
  expect(string).toBe("testing it");
  expect(rest.length).toBe(0);
});

it("splitOscString strict fails for just a string", () => {
  expect(() => splitOscString(Buffer.from("testing it"), true)).toThrowError();
});

it("splitOscString strict fails for string with not enough padding", () => {
  expect(() =>
    splitOscString(Buffer.from("testing \u0000\u0000"), true),
  ).toThrowError();
});

it("splitOscString strict fails for string with not enough padding", () => {
  const { rest, string } = splitOscString(
    Buffer.from("testing it\u0000\u0000aaaa"),
    true,
  );
  expect(string).toBe("testing it");
  expect(rest.length).toBe(4);
});

it("splitOscString strict fails for string with invalid padding", () => {
  expect(() =>
    splitOscString(Buffer.from("testing it\u0000aaaaa"), true),
  ).toThrowError();
});

it("concat throws when passed a single buffer", () => {
  expect(() => concat(Buffer.from("test") as any)).toThrowError();
});

it("concat throws when passed an array of non-buffers", () => {
  expect(() => concat(["bleh"] as any)).toThrowError();
});

it("toIntegerBuffer throws when passed a non-number", () => {
  expect(() => toIntegerBuffer("abcdefg" as any)).toThrowError();
});

it("splitInteger fails when sent a buffer that's too small", () => {
  expect(() => splitInteger(Buffer.alloc(3), "Int32")).toThrowError();
});

it("splitOscArgument fails when given a bogus type", () => {
  expect(() => splitOscArgument(Buffer.alloc(8), "bogus")).toThrowError();
});

it("fromOscMessage with no type string works", () => {
  const oscAddress = toOscString("/stuff");
  const { address, args } = fromOscMessage(oscAddress);
  expect(address).toBe("/stuff");
  expect(args).toEqual([]);
});

it("fromOscMessage with type string and no args works", () => {
  const oscAddress = toOscString("/stuff");
  const oscType = toOscString(",");
  const oscMessage = Buffer.alloc(oscAddress.length + oscType.length);
  oscAddress.copy(oscMessage);
  oscType.copy(oscMessage, oscAddress.length);
  const { address, args } = fromOscMessage(oscMessage);
  expect(address).toBe("/stuff");
  expect(args).toEqual([]);
});

it("fromOscMessage with string argument works", () => {
  const oscAddress = toOscString("/stuff");
  const oscType = toOscString(",s");
  const oscArg = toOscString("argu");
  const translate = fromOscMessage(concat([oscAddress, oscType, oscArg]));
  const { address, args } = translate;
  expect(address).toBe("/stuff");
  expect(args[0]?.type).toBe("string");
  expect(args[0]?.value).toBe("argu");
});

it("fromOscMessage with true argument works", () => {
  const oscAddress = toOscString("/stuff");
  const oscType = toOscString(",T");
  const { address, args } = fromOscMessage(concat([oscAddress, oscType]));
  expect(address).toBe("/stuff");
  expect(args[0]?.type).toBe("true");
  expect(args[0]?.value).toBe(true);
});

it("fromOscMessage with false argument works", () => {
  const oscAddress = toOscString("/stuff");
  const oscType = toOscString(",F");
  const translate = fromOscMessage(concat([oscAddress, oscType]));
  const { address, args } = translate;
  expect(address).toBe("/stuff");
  expect(args[0]?.type).toBe("false");
  expect(args[0]?.value).toBe(false);
});

it("fromOscMessage with null argument works", () => {
  const oscAddress = toOscString("/stuff");
  const oscType = toOscString(",N");
  const translate = fromOscMessage(concat([oscAddress, oscType]));
  const { address, args } = translate;
  expect(address).toBe("/stuff");
  expect(args[0]?.type).toBe("null");
  expect(args[0]?.value).toBe(null);
});

it("fromOscMessage with bang argument works", () => {
  const oscAddress = toOscString("/stuff");
  const oscType = toOscString(",I");
  const { address, args } = fromOscMessage(concat([oscAddress, oscType]));
  expect(address).toBe("/stuff");
  expect(args[0]?.type).toBe("bang");
  expect(args[0]?.value).toBe("bang");
});

it("fromOscMessage with blob argument works", () => {
  const oscAddress = toOscString("/stuff");
  const oscType = toOscString(",b");
  const oscArg = concat([toIntegerBuffer(4), Buffer.from("argu")]);
  const { address, args } = fromOscMessage(
    concat([oscAddress, oscType, oscArg]),
  );
  if (args[0]?.type === "blob") {
    expect(address).toBe("/stuff");
    expect(args[0].type).toBe("blob");
    expect(args[0].value.toString("utf-8")).toBe("argu");
  }
});

it("fromOscMessage with integer argument works", () => {
  const oscAddress = toOscString("/stuff");
  const oscType = toOscString(",i");
  const oscArg = toIntegerBuffer(888);
  const { address, args } = fromOscMessage(
    concat([oscAddress, oscType, oscArg]),
  );
  expect(address).toBe("/stuff");
  expect(args[0]?.type).toBe("integer");
  expect(args[0]?.value).toBe(888);
});

it("fromOscMessage with timetag argument works", () => {
  const oscAddress = toOscString("/stuff");
  const oscType = toOscString(",t");
  const timetag: Timetag = [8888, 9999];
  const oscArg = toTimetagBuffer(timetag);
  const { address, args } = fromOscMessage(
    concat([oscAddress, oscType, oscArg]),
  );
  expect(address).toBe("/stuff");
  expect(args[0]?.type).toBe("timetag");
  expect(args[0]?.value).toEqual(timetag);
});

it("fromOscMessage with mismatched array doesn't throw", () => {
  const oscAddress = toOscString("/stuff");
  expect(() =>
    fromOscMessage(concat([oscAddress, toOscString(",[")])),
  ).not.toThrow();
  expect(() =>
    fromOscMessage(concat([oscAddress, toOscString(",]")])),
  ).not.toThrow();
});

it("fromOscMessage with mismatched array throws in strict", () => {
  const oscAddress = toOscString("/stuff");
  expect(() =>
    fromOscMessage(concat([oscAddress, toOscString(",[", true)]), true),
  ).toThrow();
  expect(() =>
    fromOscMessage(concat([oscAddress, toOscString(",]", true)]), true),
  ).toThrow();
});

it("fromOscMessage with empty array argument works", () => {
  const oscAddress = toOscString("/stuff");
  const oscType = toOscString(",[]");
  const { address, args } = fromOscMessage(concat([oscAddress, oscType]));
  if (args[0]?.type === "array") {
    expect(address).toBe("/stuff");
    expect(args[0].type).toBe("array");
    expect(args[0].value?.length).toBe(0);
    expect(args[0].value).toEqual([]);
  }
});

it("fromOscMessage with bang array argument works", () => {
  const oscAddress = toOscString("/stuff");
  const oscType = toOscString(",[I]");
  const { address, args } = fromOscMessage(concat([oscAddress, oscType]));
  if (args[0]?.type === "array") {
    expect(address).toBe("/stuff");
    expect(args[0].type).toBe("array");
    expect(args[0].value?.length).toBe(1);
    expect(args[0].value?.[0]?.type).toBe("bang");
    expect(args[0].value?.[0]?.value).toBe("bang");
  }
});

it("fromOscMessage with string array argument works", () => {
  const oscAddress = toOscString("/stuff");
  const oscType = toOscString(",[s]");
  const oscArg = toOscString("argu");
  const { address, args } = fromOscMessage(
    concat([oscAddress, oscType, oscArg]),
  );
  if (args[0]?.type === "array") {
    expect(address).toBe("/stuff");
    expect(args[0].type).toBe("array");
    expect(args[0].value?.length).toBe(1);
    expect(args[0].value?.[0]?.type).toBe("string");
    expect(args[0].value?.[0]?.value).toBe("argu");
  }
});

it("fromOscMessage with nested array argument works", () => {
  const oscAddress = toOscString("/stuff");
  const oscType = toOscString(",[[I]]");
  const { address, args } = fromOscMessage(concat([oscAddress, oscType]));
  if (args[0]?.type === "array") {
    expect(address).toBe("/stuff");
    expect(args[0].type).toBe("array");
    expect(args[0].value?.length).toBe(1);
    if (args[0].value?.[0]?.type === "array") {
      expect(args[0].value?.[0]?.type).toBe("array");
      expect(args[0].value?.[0]?.value?.length).toBe(1);
      expect(args[0].value?.[0]?.value?.[0]?.type).toBe("bang");
      expect(args[0].value?.[0]?.value?.[0]?.value).toBe("bang");
    }
  }
});

it("fromOscMessage with multiple args works", () => {
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
  expect(args[0]?.type).toBe("string");
  expect(args[0]?.value).toBe("argu");
});

it("fromOscMessage strict fails if type string has no comma", () => {
  const oscAddress = toOscString("/stuff");
  const oscType = toOscString("fake");
  const oscMessage = concat([oscAddress, oscType]);
  expect(() => fromOscMessage(oscMessage, true)).toThrowError();
});

it("fromOscMessage non-strict works if type string has no comma", () => {
  const oscAddress = toOscString("/stuff");
  const oscType = toOscString("fake");
  const { address, args } = fromOscMessage(concat([oscAddress, oscType]));
  expect(address).toBe("/stuff");
  expect(args.length).toBe(0);
});

it("fromOscMessage strict fails if type address doesn't begin with /", () => {
  const oscAddress = toOscString("stuff");
  const oscType = toOscString(",");
  const oscMessage = concat([oscAddress, oscType]);
  expect(() => fromOscMessage(oscMessage, true)).toThrowError();
});

it("fromOscBundle works with no messages", () => {
  const oscBundle = toOscString("#bundle");
  const inputTimetag: Timetag = [0, 0];
  const oscTimetag = toTimetagBuffer(inputTimetag);
  const buffer = concat([oscBundle, oscTimetag]);
  const { elements, timetag } = fromOscBundle(buffer);
  expect(timetag).toEqual(inputTimetag);
  expect(elements).toEqual([]);
});

it("fromOscBundle works with single message", () => {
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

it("fromOscBundle works with multiple messages", () => {
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

it("fromOscBundle works with nested bundles", () => {
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

it("fromOscBundle works with non-understood messages", () => {
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

it("fromOscBundle fails with bad bundle ID", () => {
  const oscBundle = toOscString("#blunder");
  const inputTimetag: Timetag = [0, 0];
  const oscTimetag = toTimetagBuffer(inputTimetag);
  const buffer = concat([oscBundle, oscTimetag]);
  expect(() => fromOscBundle(buffer)).toThrow();
});

it("fromOscBundle fails with ridiculous sizes", () => {
  const oscBundle = toOscString("#bundle");
  const inputTimetag: Timetag = [0, 0];
  const oscTimetag = toTimetagBuffer(inputTimetag);
  const oscFakeLength = toIntegerBuffer(999999);
  const buffer = concat([oscBundle, oscTimetag, oscFakeLength]);
  expect(() => fromOscBundle(buffer)).toThrow();
});

it("toOscArgument fails when given bogus type", () => {
  expect(() => toOscArgument("bleh", "bogus")).toThrowError();
});

