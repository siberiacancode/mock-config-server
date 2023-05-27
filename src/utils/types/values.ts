export type PlainObject = Record<string, any>;
export type PlainFunction = (...args: any[]) => any;

export type CheckOneValueMode =
  | 'exists'
  | 'notExists'
  | 'isBoolean'
  | 'isNumber'
  | 'isString'
  | 'regExp';

export type CheckTwoValuesMode =
  | 'equals'
  | 'notEquals'
  | 'includes'
  | 'notIncludes'
  | 'startsWith'
  | 'notStartsWith'
  | 'endsWith'
  | 'notEndsWith'

export type CheckMode =
  | CheckOneValueMode
  | CheckTwoValuesMode
  | 'function';

export type CheckFunction = (checkMode: Exclude<CheckMode, 'function'>, firstValue: any, secondValue?: any) => boolean;

export type Data = boolean | number | string | any[] | Record<any, any> | null | undefined;
