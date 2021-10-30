import type JSONFrame from './frames/JSONFrame';

export const enum ErrorCode {
  EMPTY,
  RESOLVING_NON_ROOT,
  ENDING_UNFINISHED_FRAME,
  POP_NO_FRAME,
  UNABLE_TO_START_FRAME,
  ADVANCE_BACKWARDS,
  TRAILING_COMMA,
  UNEXPECTED_CHARACTER,
  TRIED_TO_CONSUME_AT_INVALID_STATE,
  UNIMPLEMENTED,
  RESOLVE_WHILE_INVALID,
  INVALID_STATE,
  KEYS_MUST_BE_STRINGS,
  UNEXPECTED_ROOT_DATA,
}

export default function err(type: ErrorCode): never {
  throw new ParseError(type);
}

type ParseState = {
  readonly index: number;
  readonly frames: ReadonlyArray<JSONFrame>;
};

export class ParseError extends Error {
  constructor(
    private code: ErrorCode,
    private state: ParseState | null = null,
  ) {
    super(getMessage(code));
    this.stack; // evaluate stack for v8
  }

  withState(state: ParseState): ParseError {
    return new ParseError(this.code, state);
  }

  getFrames(): ReadonlyArray<JSONFrame> {
    return this.state?.frames ?? [];
  }

  getIndex(): number | null {
    return this.state?.index ?? null;
  }
}

function getMessage(code: ErrorCode): string {
  switch (code) {
    case ErrorCode.EMPTY:
      return 'json is empty';
    case ErrorCode.RESOLVING_NON_ROOT:
      return 'cannot resolve non root';
    case ErrorCode.ENDING_UNFINISHED_FRAME:
      return 'tried to end unfinished frame';
    case ErrorCode.POP_NO_FRAME:
      return 'tried to pop with no frames';
    case ErrorCode.UNABLE_TO_START_FRAME:
      return 'unable to start frame';
    case ErrorCode.ADVANCE_BACKWARDS:
      return 'cannot move backwards in string';
    case ErrorCode.TRAILING_COMMA:
      return 'frame encountered unexpected trailing comma';
    case ErrorCode.UNEXPECTED_CHARACTER:
      return 'frame encountered unexpected character while advancing';
    case ErrorCode.TRIED_TO_CONSUME_AT_INVALID_STATE:
      return 'frame tried to consume while in a non-consuming state';
    case ErrorCode.UNIMPLEMENTED:
      return 'method is unimplemented by subclass';
    case ErrorCode.RESOLVE_WHILE_INVALID:
      return 'tried to resolve invalid frame';
    case ErrorCode.INVALID_STATE:
      return 'frame reached invalid state';
    case ErrorCode.KEYS_MUST_BE_STRINGS:
      return 'object keys must be strings';
    case ErrorCode.UNEXPECTED_ROOT_DATA:
      return 'unexpected root level data';
  }
}
