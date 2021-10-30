import { readFileSync, writeFileSync } from 'fs';
import { parse, stringify } from '../src/index';

const DATA = readFileSync('./data/data.json').toString();
const ITERATIONS = 100;

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

function rows(
  values: ReadonlyArray<number>,
  name: string,
): ReadonlyArray<string> {
  return values.map((v, i) => [name, i, v].join(','));
}

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
