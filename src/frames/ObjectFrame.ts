import type { JSONObject } from '../types';

import { ParseAction } from '../ParseAction';
import { FrameType } from '../FrameType';
import err, { ErrorCode } from '../ParseError';
import { isWhitespace } from '../utilities/characters';
import { Frame } from '../FrameUnion';
import JSONFrame from './JSONFrame';

const enum State {
  ROOT,
  KEY,
  KEY_FINISHED,
  VALUE,
  VALUE_FINISHED,
}

export default class ObjectFrame extends JSONFrame {
  public type: FrameType.OBJECT = FrameType.OBJECT;

  public static start(char: string): number | null {
    return char === '{' ? 1 : null;
  }

  private state: State = State.KEY;

  private key: string | null = null;
  private properties: JSONObject = {};
  private trailingComma = false;

  public resolve(): JSONObject {
    return this.properties;
  }

  public next(char: string): ParseAction {
    if (isWhitespace(char)) {
      return ParseAction.ADVANCE;
    }

    switch (this.state) {
      case State.VALUE:
      case State.KEY: {
        switch (char) {
          case '}': {
            if (this.trailingComma) {
              err(ErrorCode.TRAILING_COMMA);
            }
            this.valid = true;
            return ParseAction.POP;
          }
          default: {
            return ParseAction.START_VALUE;
          }
        }
      }
      case State.KEY_FINISHED: {
        if (char === ':') {
          this.state = State.VALUE;
          return ParseAction.ADVANCE;
        }
        err(ErrorCode.UNEXPECTED_CHARACTER);
      }
      case State.VALUE_FINISHED: {
        switch (char) {
          case ',': {
            this.state = State.KEY;
            this.trailingComma = true;
            return ParseAction.ADVANCE;
          }
          case '}': {
            if (this.trailingComma) {
              err(ErrorCode.TRAILING_COMMA);
            }
            this.valid = true;
            return ParseAction.POP;
          }
        }
      }
    }
    err(ErrorCode.UNEXPECTED_CHARACTER);
  }

  public consume(frame: Frame): void {
    switch (this.state) {
      case State.VALUE: {
        if (this.key === null) {
          err(ErrorCode.KEYS_MUST_BE_STRINGS);
        }
        this.properties[this.key] = frame.resolve();
        this.state = State.VALUE_FINISHED;
        this.trailingComma = false;
        break;
      }
      case State.KEY: {
        if (frame.type !== FrameType.STRING) {
          err(ErrorCode.KEYS_MUST_BE_STRINGS);
        }
        this.key = frame.resolve();
        this.state = State.KEY_FINISHED;
        break;
      }
      default: {
        err(ErrorCode.TRIED_TO_CONSUME_AT_INVALID_STATE);
      }
    }
  }
}
