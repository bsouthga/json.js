import { ParseAction } from '../ParseAction';
import { isDigit, isNonZeroDigit } from '../utilities/characters';
import err, { ErrorCode } from '../ParseError';
import { FrameType } from '../FrameType';
import JSONFrame from './JSONFrame';

const enum State {
  SIGN,
  INTEGER_LEADING_DIGIT,
  INTEGER_ADDITIONAL_DIGITS,
  DECIMAL_POINT,
  FRACTION_LEADING_DIGIT,
  FRACTION_ADDITIONAL_DIGITS,
  EXPONENT_SIGN,
  EXPONENT_DIGITS,
  END,
}

export default class NumberFrame extends JSONFrame {
  public type: FrameType.NUMBER = FrameType.NUMBER;

  public static start(char: string): number | null {
    return isDigit(char) || char === '-' ? 0 : null; // advance by 0 to consume
  }

  private chars: string[] = [];
  private state: State = State.SIGN;

  public resolve(): number {
    const source = this.chars.join('');
    if (!this.valid) {
      err(ErrorCode.RESOLVE_WHILE_INVALID);
    }
    return Number(source);
  }

  public next(char: string): ParseAction {
    const state = this.reduce(char);
    if (state === State.END) {
      return ParseAction.POP_NO_ADVANCE;
    } else {
      this.state = state;
      return ParseAction.ADVANCE;
    }
  }

  private goValid(char: string, state: State): State {
    this.chars.push(char);
    this.valid = true;
    return state;
  }

  private goInvalid(char: string, state: State): State {
    this.chars.push(char);
    this.valid = false;
    return state;
  }

  private reduce(char: string): State {
    switch (this.state) {
      case State.SIGN: {
        switch (char) {
          case '0': {
            return this.goValid(char, State.DECIMAL_POINT);
          }
          case '-': {
            return this.goInvalid(char, State.INTEGER_LEADING_DIGIT);
          }
          default: {
            if (isNonZeroDigit(char)) {
              return this.goValid(char, State.INTEGER_ADDITIONAL_DIGITS);
            } else {
              err(ErrorCode.UNEXPECTED_CHARACTER);
            }
          }
        }
      }
      case State.DECIMAL_POINT: {
        switch (char) {
          case '.': {
            return this.goInvalid(char, State.FRACTION_LEADING_DIGIT);
          }
          case 'E':
          case 'e': {
            return this.goInvalid(char, State.EXPONENT_SIGN);
          }
          default: {
            return State.END;
          }
        }
      }
      case State.INTEGER_LEADING_DIGIT: {
        switch (char) {
          case '0': {
            return this.goValid(char, State.DECIMAL_POINT);
          }
          default: {
            if (isNonZeroDigit(char)) {
              return this.goValid(char, State.INTEGER_ADDITIONAL_DIGITS);
            } else {
              err(ErrorCode.UNEXPECTED_CHARACTER);
            }
          }
        }
      }
      case State.INTEGER_ADDITIONAL_DIGITS: {
        switch (char) {
          case '.': {
            return this.goInvalid(char, State.FRACTION_LEADING_DIGIT);
          }
          case 'E':
          case 'e': {
            return this.goInvalid(char, State.EXPONENT_SIGN);
          }
          default: {
            if (isDigit(char)) {
              return this.goValid(char, State.INTEGER_ADDITIONAL_DIGITS);
            } else {
              return State.END;
            }
          }
        }
      }
      case State.FRACTION_LEADING_DIGIT: {
        if (isDigit(char)) {
          return this.goValid(char, State.FRACTION_ADDITIONAL_DIGITS);
        } else {
          return State.END;
        }
      }
      case State.FRACTION_ADDITIONAL_DIGITS: {
        switch (char) {
          case 'E':
          case 'e': {
            return this.goInvalid(char, State.EXPONENT_SIGN);
          }
          default: {
            if (isDigit(char)) {
              return this.goValid(char, State.FRACTION_ADDITIONAL_DIGITS);
            } else {
              return State.END;
            }
          }
        }
      }
      case State.EXPONENT_SIGN: {
        switch (char) {
          case '-':
          case '+': {
            return this.goInvalid(char, State.EXPONENT_DIGITS);
          }
          default: {
            if (isDigit(char)) {
              return this.goValid(char, State.EXPONENT_DIGITS);
            } else {
              err(ErrorCode.UNEXPECTED_CHARACTER);
            }
          }
        }
      }
      case State.EXPONENT_DIGITS: {
        if (isDigit(char)) {
          return this.goValid(char, State.EXPONENT_DIGITS);
        } else {
          return State.END;
        }
      }
      case State.END: {
        err(ErrorCode.INVALID_STATE);
      }
    }
  }
}
