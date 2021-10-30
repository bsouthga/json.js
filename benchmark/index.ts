import { readFileSync } from 'fs';
import { parse, stringify } from '../src/index';
import { JSONValue } from '../src/types';

const DATA = readFileSync('./data/data.json').toString();
const ITERATIONS = 100;

function testParse(json: string, parser: (json: string) => unknown): number {
  const start = performance.now();
  let i = ITERATIONS;
  while (i--) {
    parser(json);
  }
  const end = performance.now();
  return end - start;
}

function testStringify(
  json: JSONValue,
  stringify: (value: JSONValue) => unknown,
): number {
  const start = performance.now();
  let i = ITERATIONS;
  while (i--) {
    stringify(json);
  }
  const end = performance.now();
  return end - start;
}

const libParse = testParse(DATA, parse);
const builtinParse = testParse(DATA, (s) => JSON.parse(s));

console.log(
  `lib took ${Math.round((libParse * 100) / builtinParse) / 100}x of built-in`,
);

const parsed = JSON.parse(DATA);

const libStringify = testStringify(parsed, stringify);
const builtinStringify = testStringify(parsed, (v) => JSON.stringify(v));

console.log(
  `lib took ${
    Math.round((libStringify * 100) / builtinStringify) / 100
  }x of built-in`,
);
