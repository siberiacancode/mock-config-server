export type PlainObject = Record<string, any>;
export type PlainFunction = (...args: any[]) => any;

export type CheckOneValueMode =
  | 'exists'
  | 'notExists'
  | 'isBoolean'
  | 'isNumber'
  | 'isString';

export type CheckTwoValuesMode =
  | 'equals'
  | 'notEquals'
  | 'includes'
  | 'notIncludes'
  | 'startsWith'
  | 'notStartsWith'
  | 'endsWith'
  | 'notEndsWith'
  | 'regExp'
  | 'function';

export type CheckMode =
  | CheckOneValueMode
  | CheckTwoValuesMode

export type CheckFunction = (checkMode: Exclude<CheckMode, 'function'>, firstValue: any, secondValue?: any) => boolean;

export type Data = boolean | number | string | any[] | Record<any, any> | null | undefined;
