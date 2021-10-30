import { ParseAction } from './ParseAction';
import ArrayFrame from './frames/ArrayFrame';
import { isWhitespace } from './utilities/characters';
import err, { ErrorCode, ParseError } from './ParseError';
import { FrameType } from './FrameType';
import type { Frame } from './FrameUnion';
import NumberFrame from './frames/NumberFrame';
import ObjectFrame from './frames/ObjectFrame';
import { FalseFrame, NullFrame, TrueFrame } from './frames/PrimativeFrame';
import RootFrame from './frames/RootFrame';
import StringFrame from './frames/StringFrame';
import type { JSONValue } from './types';

const ALL_FRAMES = [
  ObjectFrame,
  ArrayFrame,
  StringFrame,
  NumberFrame,
  TrueFrame,
  FalseFrame,
  NullFrame,
];

export default class Parser {
  private frames: Frame[] = [new RootFrame()];
  private data = false;

  public constructor(private input: string) {}

  public parse(): JSONValue {
    const input = this.input;
    const total = input.length;
    let index = 0;

    try {
      // skip whitespace
      while (isWhitespace(input[index])) {
        index++;
      }

      if (index < total) {
        this.data = true;
      }

      while (index < total) {
        index += this.next(index);
      }

      return this.resolve();
    } catch (error) {
      if (error instanceof ParseError) {
        const frames = this.frames;
        throw error.withState({ index, frames });
      }
      throw error;
    }
  }

  private next(index: number): number {
    const input = this.input;
    const char = input[index];
    const frame = this.peek();

    switch (frame.next(char)) {
      case ParseAction.ADVANCE: {
        return 1;
      }
      case ParseAction.POP_NO_ADVANCE: {
        this.pop();
        return 0;
      }
      case ParseAction.POP: {
        this.pop();
        return 1;
      }
      case ParseAction.START_VALUE: {
        return this.startValue(index);
      }
    }
  }

  private startValue(index: number): number {
    const input = this.input;
    const char = input[index];

    if (isWhitespace(char)) {
      return 1;
    }

    for (const Frame of ALL_FRAMES) {
      const advance = Frame.start(char, index, input);
      if (advance !== null) {
        this.push(new Frame());
        if (advance < 0) {
          err(ErrorCode.ADVANCE_BACKWARDS);
        }
        return advance;
      }
    }

    err(ErrorCode.UNABLE_TO_START_FRAME);
  }

  private pop(): void {
    const frame = this.peek(1);
    const parent = this.peek(2);

    if (frame == null) {
      err(ErrorCode.POP_NO_FRAME);
    }

    if (!frame.isValid()) {
      err(ErrorCode.ENDING_UNFINISHED_FRAME);
    }

    parent.consume(frame);

    // pop after consuming so we can show
    // the current frame in error messages
    this.frames.pop();
  }

  private push(frame: Frame): void {
    this.frames.push(frame);
  }

  private peek(n = 0): Frame {
    const frames = this.frames;
    return frames[frames.length - 1 - n];
  }

  private resolve(): JSONValue {
    if (!this.data) {
      err(ErrorCode.EMPTY);
    }

    while (this.frames.length !== 1) {
      this.pop();
    }

    const top = this.frames[0];

    if (top.type !== FrameType.ROOT) {
      err(ErrorCode.RESOLVING_NON_ROOT);
    }

    return top.resolve();
  }
}
