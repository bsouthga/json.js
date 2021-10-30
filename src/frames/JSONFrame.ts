import type { JSONValue } from '../types';
import { ParseAction } from '../ParseAction';
import err, { ErrorCode } from '../ParseError';
import { FrameType } from '../FrameType';

/**
 * base class for a parser frame
 */
export default abstract class JSONFrame {
  public abstract type: FrameType;
  public abstract resolve(): JSONValue;
  public abstract next(char: string): ParseAction;

  // if we return a number, start this frame and advance by <number>
  public static start(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _char: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _index: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _input: string,
  ): number | null {
    err(ErrorCode.UNIMPLEMENTED);
  }

  protected valid: boolean = false;

  public isValid(): boolean {
    return this.valid;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public consume(_frame: JSONFrame): void {
    err(ErrorCode.UNIMPLEMENTED);
  }
}
