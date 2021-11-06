import err, { ErrorCode } from './ParseError';
import { JSONArray, JSONValue } from './types';
import { isDigit, isLiteral } from './utilities/characters';

type State = {
  index: number;
  input: string;
};

type Result<Value extends JSONValue = JSONValue> = {
  index: number;
  value: Value;
};

export function parse(input: string): JSONValue {
  return parseValue({ input, index: 0 }).value;
}

function parseValue(state: State): Result {
  const { input, index } = state;
  const char = input[index];
  switch (char) {
    case '{':
      return parseObject(next(state));
    case '[':
      return parseArray(next(state));
    case '"':
      return parseString(next(state));
    case 'n':
      return literal(state, 'null', null);
    case 't':
      return literal(state, 'true', true);
    case 'f':
      return literal(state, 'false', false);
    default: {
      if (isDigit(char)) {
        return parseNumber(state);
      }
      unexpected();
    }
  }
}

function literal(state: State, s: string, value: JSONValue): Result {
  const { input, index } = state;
  if (isLiteral(input, index, s)) {
    return { value, index: index + s.length };
  }
  unexpected();
}

function parseObject(state: State): Result {
  const value: JSONArray = [];
  const { input } = state;
  let { index } = state;

  let key: string | null = null;
  while (input[index] !== '}') {
    switch (input[index]) {
      case '"': {
        const result = parseString({ input, index: index + 1 });
        index = result.index;
        key = result.value;
        break;
      }
      case ':': {
        const value = parseValue({ input, index: index + 1 });
      }
      default: {
        const result = parseValue({ input, index });
        index = index + result.index;
        value.push(result.value);
      }
    }
  }

  return { value, index };
}

function parseArray(state: State): Result<JSONArray> {
  const value: JSONArray = [];
  const { input } = state;
  let { index } = state;

  while (input[index] !== ']') {
    const result = parseValue({ input, index });
    index = index + result.index;
    value.push(result.value);
  }

  return { value, index };
}

function parseString(state: State): Result<string> {
  throw new Error('Function not implemented.');
}
function parseNumber(state: State): Result<number> {
  throw new Error('Function not implemented.');
}

function unexpected(): never {
  err(ErrorCode.UNEXPECTED_CHARACTER);
}

function next(state: State): State {
  return { ...state, index: state.index + 1 };
}
