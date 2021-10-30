import { ParseAction } from '../ParseAction';
import { isLiteral } from '../utilities/characters';
import err, { ErrorCode } from '../ParseError';
import { FrameType } from '../FrameType';
import JSONFrame from './JSONFrame';

const DEFAULT_LITERAL = '__SET__';

export abstract class PrimativeFrame extends JSONFrame {
  protected valid = true;

  public static literal: string = DEFAULT_LITERAL;

  public static start(
    _char: string,
    index: number,
    input: string,
  ): number | null {
    const literal = this.literal;
    const total = literal.length;
    if (literal === DEFAULT_LITERAL) {
      err(ErrorCode.UNIMPLEMENTED);
    }
    return isLiteral(input, index, literal) ? total : null;
  }

  // we always want to immediately finish literal frames
  public next(): ParseAction {
    return ParseAction.POP_NO_ADVANCE;
  }
}

export class FalseFrame extends PrimativeFrame {
  public type: FrameType.LITERAL = FrameType.LITERAL;
  public static literal = 'false';
  public resolve(): boolean {
    return false;
  }
}

export class TrueFrame extends PrimativeFrame {
  public type: FrameType.LITERAL = FrameType.LITERAL;
  public static literal = 'true';
  public resolve(): boolean {
    return true;
  }
}

export class NullFrame extends PrimativeFrame {
  public type: FrameType.LITERAL = FrameType.LITERAL;
  public static literal = 'null';
  public resolve(): null {
    return null;
  }
}
