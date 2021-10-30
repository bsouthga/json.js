import { JSONArray, JSONObject, JSONValue, Replacer } from './types';
import { escapeString, fillSpaces } from './utilities/characters';

const enum Type {
  KEY,
  VALUE,
  COMMA,
  CLOSE_OBJECT,
  CLOSE_ARRAY,
}

type BasicFrame =
  | { type: Type.CLOSE_ARRAY }
  | { type: Type.CLOSE_OBJECT }
  | { type: Type.COMMA };

type StackFrame =
  | { type: Type.KEY; key: string }
  | { type: Type.VALUE; value: JSONValue; pad: boolean }
  | BasicFrame;

export default class Stringifier {
  private replacer: Replacer;
  private tokens: string[] = [];
  private stack: StackFrame[] = [valueFrame(this.root)];
  private spaces: string | null = null;

  constructor(
    private root: JSONValue,
    replacer: Replacer | Array<string> | null = null,
    spaces: number | string | null = null,
  ) {
    this.replacer = resolveReplacer(replacer);
    this.spaces = resolveSpaces(spaces);
  }

  private pad(indent: number, newline = true): void {
    const spaces = this.spaces;
    if (spaces == null) {
      return;
    }
    if (newline) {
      this.write('\n');
    }
    for (let i = 0; i < indent; i++) {
      this.write(spaces);
    }
  }

  private write(char: string): void {
    this.tokens.push(char);
  }

  private push(frame: StackFrame): void {
    this.stack.push(frame);
  }

  private pop(): StackFrame | undefined {
    return this.stack.pop();
  }

  private resolve(): string {
    const result = this.tokens.join('');
    this.tokens = [];
    this.stack = [valueFrame(this.root)];
    return result;
  }

  public stringify(): string {
    const replacer = this.replacer;
    let indent = 0;
    let frame: StackFrame | undefined;

    // eslint-disable-next-line no-cond-assign
    while ((frame = this.pop())) {
      switch (frame.type) {
        case Type.VALUE: {
          const value = frame.value;

          if (frame.pad) {
            this.pad(indent, indent !== 0);
          }

          if (
            value === null ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            typeof value === 'string'
          ) {
            this.write(
              typeof value === 'string'
                ? escapeString(value)
                : value?.toString() ?? 'null',
            );
            continue;
          }

          if (isArrayValue(value)) {
            if (value.length === 0) {
              this.write('[]');
              continue;
            }
            this.write('[');
            indent++;
            this.push(getFrame(Type.CLOSE_ARRAY));
            for (let i = value.length - 1; i >= 0; i--) {
              // default  to null to match spec
              const replaced = replacer.call(value, i, value[i]) ?? null;
              this.push(valueFrame(replaced, true));
              if (i !== 0) {
                this.push(getFrame(Type.COMMA));
              }
            }
            continue;
          }

          // object...
          const keys = Object.keys(value);
          if (keys.length === 0) {
            this.write('{}');
            continue;
          }
          this.write('{');
          indent++;
          this.push(getFrame(Type.CLOSE_OBJECT));
          for (let i = keys.length - 1; i >= 0; i--) {
            const key = keys[i];
            const replaced = replacer.call(value, key, value[key]);

            // skip value if we return undefined
            if (replaced === undefined) {
              continue;
            }

            this.push(valueFrame(replaced));
            this.push(keyFrame(key));
            if (i !== 0) {
              this.push(getFrame(Type.COMMA));
            }
          }
          continue;
        }
        case Type.CLOSE_ARRAY: {
          indent--;
          this.pad(indent);
          this.write(']');
          continue;
        }
        case Type.CLOSE_OBJECT: {
          indent--;
          this.pad(indent);
          this.write('}');
          continue;
        }
        case Type.COMMA: {
          this.write(',');
          continue;
        }
        case Type.KEY: {
          this.pad(indent);
          this.write(escapeString(frame.key));
          this.write(':');
          if (this.spaces != null) {
            this.write(' ');
          }
          continue;
        }
      }
    }

    return this.resolve();
  }
}

function isArrayValue<A, B>(
  value: A | readonly B[] | null | undefined,
): value is B[] {
  return value != null && Array.isArray(value);
}

function valueFrame(value: JSONValue, pad: boolean = false): StackFrame {
  return { type: Type.VALUE, value, pad };
}

function keyFrame(key: string): StackFrame {
  return { type: Type.KEY, key };
}
function getFrame(type: BasicFrame['type']): BasicFrame {
  return { type };
}

function resolveSpaces(spaces: number | string | null): string | null {
  return typeof spaces === 'number' ? fillSpaces(spaces) : spaces;
}

function identityReplacer(
  this: JSONObject | JSONArray,
  _key: string | number,
  value: JSONValue,
): JSONValue | undefined {
  return value;
}

function resolveReplacer(replacer: Replacer | Array<string> | null): Replacer {
  if (replacer == null) {
    return identityReplacer;
  }

  return isArrayValue(replacer)
    ? getReplacerFromPropertiesArray(replacer)
    : replacer;
}

function getReplacerFromPropertiesArray(properties: Array<string>): Replacer {
  // function declaration for context
  function replacerFromArray(
    this: JSONObject | JSONArray,
    key: string | number,
    value: JSONValue,
  ): JSONValue | undefined {
    // skip array values when given array-based replacer
    if (isArrayValue(this)) {
      return value;
    }

    return typeof key === 'string' && properties.indexOf(key) !== -1
      ? value
      : undefined;
  }

  return replacerFromArray;
}
