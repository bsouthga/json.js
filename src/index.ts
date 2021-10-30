import Parser from './Parser';
import Stringifier from './Stringifier';
import type { Replacer, JSONValue } from './types';

export function parse(input: string): JSONValue {
  const parser = new Parser(input);
  return parser.parse();
}

export function stringify(
  value: JSONValue,
  replacer?: Replacer | Array<string> | null,
  spaces?: number | string,
): string {
  const stringifier = new Stringifier(value, replacer, spaces);
  return stringifier.stringify();
}
