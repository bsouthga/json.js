import { ParseAction } from '../ParseAction';
import { isWhitespace } from '../utilities/characters';
import err, { ErrorCode } from '../ParseError';
import { FrameType } from '../FrameType';
import type { Frame } from '../FrameUnion';
import type { JSONValue } from '../types';
import JSONFrame from './JSONFrame';

export default class RootFrame extends JSONFrame {
  public type: FrameType.ROOT = FrameType.ROOT;
  private value: JSONValue = null;

  public static start(): null {
    return null; // can't start a root frame
  }

  public next(char: string): ParseAction {
    if (isWhitespace(char)) {
      return ParseAction.ADVANCE;
    }
    return ParseAction.START_VALUE;
  }

  public resolve(): JSONValue {
    return this.value;
  }

  public consume(frame: Frame): void {
    if (this.isValid()) {
      err(ErrorCode.UNEXPECTED_ROOT_DATA);
    }
    this.value = frame.resolve();
    this.valid = true;
  }
}
