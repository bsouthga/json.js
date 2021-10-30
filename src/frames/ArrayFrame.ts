import type { Frame } from '../FrameUnion';
import type { JSONArray } from '../types';

import { ParseAction } from '../ParseAction';
import { isWhitespace } from '../utilities/characters';
import err, { ErrorCode } from '../ParseError';
import { FrameType } from '../FrameType';
import JSONFrame from './JSONFrame';

const enum State {
  ROOT,
  VALUE,
  VALUE_FINISHED,
}

export default class ArrayFrame extends JSONFrame {
  public type: FrameType.ARRAY = FrameType.ARRAY;

  public static start(char: string): number | null {
    return char === '[' ? 1 : null;
  }

  private state: State = State.VALUE;
  private elements: JSONArray = [];
  private trailingComma = false;

  public resolve(): JSONArray {
    return this.elements;
  }

  public next(char: string): ParseAction {
    if (isWhitespace(char)) {
      return ParseAction.ADVANCE;
    }

    switch (this.state) {
      case State.VALUE: {
        switch (char) {
          case ']': {
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
      case State.VALUE_FINISHED: {
        switch (char) {
          case ',': {
            this.state = State.VALUE;
            this.valid = false;
            this.trailingComma = true;
            return ParseAction.ADVANCE;
          }
          case ']': {
            if (this.trailingComma) {
              err(ErrorCode.TRAILING_COMMA);
            }
            this.valid = true;
            return ParseAction.POP;
          }
        }
        break;
      }
    }
    err(ErrorCode.UNEXPECTED_CHARACTER);
  }

  public consume(frame: Frame): void {
    switch (this.state) {
      case State.VALUE: {
        this.elements.push(frame.resolve());
        this.state = State.VALUE_FINISHED;
        this.trailingComma = false;
        break;
      }
      default: {
        err(ErrorCode.TRIED_TO_CONSUME_AT_INVALID_STATE);
      }
    }
  }
}
