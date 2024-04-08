const { describe, it } = require("mocha");
const assert = require("assert");
const osc = require("../dist/index.cjs");

function testString(str, expectedLength) {
  return {
    str: str,
    len: expectedLength,
  };
}

const testData = [
  testString("abc", 4),
  testString("abcd", 8),
  testString("abcde", 8),
  testString("abcdef", 8),
  testString("abcdefg", 8),
];

function testStringLength(str, expected_len) {
  const oscStr = osc.toOscString(str);
  assert.strictEqual(oscStr.length, expected_len);
}

describe("basic strings length", () => {
  for (const data of testData) {
    it(data.str, () => {
      testStringLength(data.str, data.len);
    });
  }
});

function testStringRoundTrip(str, strict) {
  const oscStr = osc.toOscString(str);
  const str2 = osc.splitOscString(oscStr, strict)?.string;
  assert.strictEqual(str, str2);
}

describe("basic strings round trip", () => {
  for (const data of testData) {
    it(data.str, () => {
      testStringRoundTrip(data.str, true);
    });
  }
});

it("non strings fail toOscString", () => {
  assert.throws(() => osc.toOscString(7));
});

it("strings with null characters don't fail toOscString by default", () => {
  assert.notEqual(osc.toOscString("\u0000"), null);
});

it("strings with null characters fail toOscString in strict mode", () => {
  assert.throws(() => osc.toOscString("\u0000", true));
});

it("osc buffers with no null characters fail splitOscString in strict mode", () => {
  assert.throws(() => osc.splitOscString(Buffer.from("abc"), true));
});

it("osc buffers with non-null characters after a null character fail fromOscString in strict mode", () => {
  assert.throws(() => osc.fromOscString(Buffer.from("abc\u0000abcd"), true));
});

describe("basic strings pass fromOscString in strict mode", () => {
  for (const data of testData) {
    it(data.str, () => {
      testStringRoundTrip(data.str, true);
    });
  }
});

it("osc buffers with non-four length fail in strict mode", () => {
  assert.throws(() => osc.fromOscString(Buffer.from("abcd\u0000\u0000"), true));
});

it("splitOscString throws when passed a non-buffer", () => {
  assert.throws(() => osc.splitOscString("test"));
});

it("splitOscString of an osc-string matches the string", () => {
  const split = osc.splitOscString(osc.toOscString("testing it"));
  assert.strictEqual(split?.string, "testing it");
  assert.strictEqual(split?.rest?.length, 0);
});

it("splitOscString works with an over-allocated buffer", () => {
  const buffer = osc.toOscString("testing it");
  const overAllocated = Buffer.alloc(16);
  buffer.copy(overAllocated);
  const split = osc.splitOscString(overAllocated);
  assert.strictEqual(split?.string, "testing it");
  assert.strictEqual(split?.rest?.length, 4);
});
