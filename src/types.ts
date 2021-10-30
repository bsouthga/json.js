export type JSONObject = { [key: string]: JSONValue };

export type JSONArray = JSONValue[];

export type JSONValue =
  | JSONObject
  | JSONArray
  | string
  | boolean
  | number
  | null;

export type Replacer = (
  this: JSONObject | JSONArray,
  key: string | number,
  value: JSONValue,
) => JSONValue | undefined;
