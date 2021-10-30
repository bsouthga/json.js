import { ParseAction } from '../ParseAction';
import {
  isControlCharacter,
  isHexDigit,
  isWhiteSpaceLiteral,
} from '../utilities/characters';
import err, { ErrorCode } from '../ParseError';
import { FrameType } from '../FrameType';
import JSONFrame from './JSONFrame';

const enum State {
  ANY_CHARACTER,
  POST_BACK_SLASH,
  UNICODE,
  END,
}

export default class StringFrame extends JSONFrame {
  private state: State = State.ANY_CHARACTER;
  public type: FrameType.STRING = FrameType.STRING;

  public static start(char: string): number | null {
    return char === '"' ? 1 : null;
  }

  private chars: string[] = [];
  private unicode: string[] = new Array(4);
  private unicodeIndex = 0;

  public resolve(): string {
    return this.chars.join('');
  }

  public next(char: string): ParseAction {
    this.state = this.reduce(char);
    return this.state === State.END ? ParseAction.POP : ParseAction.ADVANCE;
  }

  private reduce(char: string): State {
    switch (this.state) {
      case State.ANY_CHARACTER: {
        switch (char) {
          case '\\': {
            return State.POST_BACK_SLASH;
          }
          case '"': {
            this.valid = true;
            return State.END;
          }
          default: {
            if (isWhiteSpaceLiteral(char) || isControlCharacter(char)) {
              err(ErrorCode.UNEXPECTED_CHARACTER);
            }

            this.chars.push(char);
            return State.ANY_CHARACTER;
          }
        }
      }
      case State.POST_BACK_SLASH: {
        switch (char) {
          case '"':
          case '\\':
          case '/': {
            this.chars.push(char);
            return State.ANY_CHARACTER;
          }
          case 'b': {
            this.chars.push('\b');
            return State.ANY_CHARACTER;
          }
          case 'f': {
            this.chars.push('\f');
            return State.ANY_CHARACTER;
          }
          case 'n': {
            this.chars.push('\n');
            return State.ANY_CHARACTER;
          }
          case 'r': {
            this.chars.push('\r');
            return State.ANY_CHARACTER;
          }
          case 't': {
            this.chars.push('\t');
            return State.ANY_CHARACTER;
          }
          case 'u': {
            return State.UNICODE;
          }
          default: {
            err(ErrorCode.UNEXPECTED_CHARACTER);
          }
        }
      }
      case State.UNICODE: {
        if (isHexDigit(char)) {
          if (this.unicodeIndex === 3) {
            this.unicode[this.unicodeIndex] = char;
            const hex = parseInt(this.unicode.join(''), 16);
            const uChar = String.fromCharCode(hex);
            this.chars.push(uChar);
            this.unicodeIndex = 0;
            return State.ANY_CHARACTER;
          } else {
            this.unicode[this.unicodeIndex] = char;
            this.unicodeIndex++;
            return State.UNICODE;
          }
        } else {
          err(ErrorCode.UNEXPECTED_CHARACTER);
        }
      }
      case State.END: {
        err(ErrorCode.INVALID_STATE);
      }
    }
  }
}
