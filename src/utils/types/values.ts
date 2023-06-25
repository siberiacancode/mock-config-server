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

export type CheckFunction = <ActualValue extends any = any, DescriptorValue extends any = any>
  (checkMode: CheckMode, actualValue: ActualValue, descriptorValue?: DescriptorValue) => boolean;

// todo: string or object
export type Data = boolean | number | string | any[] | Record<any, any>;
