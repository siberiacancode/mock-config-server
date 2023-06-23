export type PlainObject = Record<string, any>;
export type PlainFunction = (...args: any[]) => any;

export type CheckActualValueCheckMode =
  | 'exists'
  | 'notExists'

export type CompareWithExpectedValueCheckMode =
  | 'equals'
  | 'notEquals'
  | 'includes'
  | 'notIncludes'
  | 'startsWith'
  | 'notStartsWith'
  | 'endsWith'
  | 'notEndsWith';

export type CalculateByExpectedValueCheckMode =
  | 'regExp'
  | 'function';

export type CheckMode =
  | CheckActualValueCheckMode
  | CompareWithExpectedValueCheckMode
  | CalculateByExpectedValueCheckMode

export type CheckFunction = (checkMode: CheckMode, actualValue: any, descriptorValue?: any) => boolean;

// todo: string or object
export type Data = boolean | number | string | any[] | Record<any, any>;
