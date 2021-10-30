import * as fs from 'fs';
import * as path from 'path';
import { parse, stringify } from '../src/index';
import { Replacer } from '../src/types';

const ROOT = path.join(__dirname, '../../');
const TEST_CASE_DIR = path.join(ROOT, './test/cases');
const CASES = fs.readdirSync(TEST_CASE_DIR).filter((f) => f.endsWith('.json'));
// const CASES = ['y_object_long_strings.json'];

main().catch(console.error);

function test(filename: string, json: string): void {
  try {
    JSON.parse(json);
    equivalentParse(json);
  } catch {
    let threw = false;
    let result: unknown;
    try {
      result = parse(json);
    } catch {
      threw = true;
    }
    if (!threw) {
      console.log(result);
      throw new Error(`built-in json parser threw, but jsonojs did not`);
    }
  }
}

async function main(): Promise<void> {
  const testCases = await Promise.all(
    CASES.map((filename) =>
      fs.promises
        .readFile(path.join(TEST_CASE_DIR, filename))
        .then((f) => [filename, f.toString()] as const),
    ),
  );

  let passed = 0;
  let failed = 0;

  for (const [filename, json] of testCases) {
    try {
      test(filename, json);
      passed++;
    } catch (err) {
      failed++;
      if (err instanceof Error) {
        console.log(`[failed] ${filename}: ${err.message}`);
      }
    }
  }

  for (const [filename, json] of testCases) {
    if (!filename.startsWith('y')) {
      continue;
    }

    try {
      stringifyTest(json);
      passed++;
    } catch (err) {
      failed++;
      if (err instanceof Error) {
        console.log(`[failed] ${filename}: ${err.message}`);
      }
    }
  }

  for (const [filename, json] of testCases) {
    if (!filename.startsWith('y')) {
      continue;
    }

    try {
      prettifyTests(json);
      passed++;
    } catch (err) {
      failed++;
      if (err instanceof Error) {
        console.log(`[failed] ${filename}: ${err.message}`);
      }
    }
  }

  const total = passed + failed;
  console.log(`${passed}/${total} succeeded`);
}

function equivalentParse(json: string): void {
  const libParsed = parse(json);
  const lib = JSON.stringify(libParsed);
  const builtin = JSON.stringify(JSON.parse(json));
  if (lib !== builtin) {
    console.log(`lib: ${lib}, builtin: ${builtin}`);
    throw new Error('json not equivalent');
  }
}

function stringifyTest(json: string): void {
  const parsed = JSON.parse(json);
  const lib = stringify(parsed);
  const builtin = JSON.stringify(parsed);
  if (builtin !== lib) {
    console.log(`\nlib:\n${lib}\nbuiltin:\n${builtin}`);
    throw new Error(`stringified result does not match`);
  }
}

function prettifyTests(json: string): void {
  const parsed = JSON.parse(json);

  const args: [Replacer | undefined, number | string | undefined][] = [
    [undefined, undefined],
    [undefined, 2],
    [undefined, '\t'],
  ];

  for (const [replacer, spaces] of args) {
    const lib = stringify(parsed, replacer, spaces);
    const builtin = JSON.stringify(parsed, replacer, spaces);
    if (builtin !== lib) {
      console.log(`\nlib:\n${lib}\nbuiltin:\n${builtin}\n`, [replacer, spaces]);
      throw new Error(`prettified result does not match`);
    }
  }
}
