import type RootFrame from "./frames/RootFrame";
import type ObjectFrame from "./frames/ObjectFrame";
import type ArrayFrame from "./frames/ArrayFrame";
import type StringFrame from "./frames/StringFrame";
import type NumberFrame from "./frames/NumberFrame";
import type { FalseFrame, NullFrame, TrueFrame } from "./frames/PrimativeFrame";

export type Frame =
  | RootFrame
  | ObjectFrame
  | ArrayFrame
  | StringFrame
  | NumberFrame
  | TrueFrame
  | FalseFrame
  | NullFrame;
