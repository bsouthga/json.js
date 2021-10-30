import { readFileSync, writeFileSync } from 'fs';
import { parse, stringify } from '../src/index';

const DATA = readFileSync('./data/data.json').toString();
const ITERATIONS = 50;

function test<T>(
  payload: T,
  predicate: (p: T) => unknown,
): ReadonlyArray<number> {
  const samples = [];
  let i = ITERATIONS;
  while (i--) {
    const start = performance.now();
    predicate(payload);
    const end = performance.now();
    samples.push(end - start);
  }
  return samples;
}
// warmup
const parsed = JSON.parse(DATA);
parse(DATA);

const libParse = test(DATA, parse);
const builtinParse = test(DATA, (s) => JSON.parse(s));
const libStringify = test(parsed, stringify);
const builtinStringify = test(parsed, (v) => JSON.stringify(v));

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function median(values: ReadonlyArray<number>): number {
  const sorted = values.slice().sort();
  const total = sorted.length;
  const middle = Math.floor(sorted.length / 2);
  if (total % 2 === 0) {
    return round((sorted[middle - 1] + sorted[middle]) / 2);
  }
  return round(sorted[middle]);
}

function rows(
  values: ReadonlyArray<number>,
  name: string,
): ReadonlyArray<string> {
  return values.map((v, i) => [name, i, v].join(','));
}

function report(
  lib: ReadonlyArray<number>,
  builtin: ReadonlyArray<number>,
): string {
  return `lib=${median(lib)}ms, builtin=${median(builtin)}ms`;
}

console.log(`parsing: ${report(libParse, builtinParse)}`);
console.log(`stringify: ${report(libStringify, builtinStringify)}`);

writeFileSync(
  './data/results.csv',
  [
    ['test', 'index', 'ms'].join(','),
    ...rows(libParse, 'libParse'),
    ...rows(builtinParse, 'builtinParse'),
    ...rows(libStringify, 'libStringify'),
    ...rows(builtinStringify, 'builtinStringify'),
  ].join('\n'),
);
