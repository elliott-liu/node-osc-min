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
} from "src";

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

// it("splitOscString strict fails for string with not enough padding", () => {
//   expect(() =>
//     splitOscString(Buffer.from("testing \u0000\u0000"), true),
//   ).toThrowError();
// });

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

});
