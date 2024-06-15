export type CheckActualValueCheckMode = 'exists' | 'notExists';

export type CompareWithDescriptorAnyValueCheckMode = 'equals' | 'notEquals';

export type CompareWithDescriptorStringValueCheckMode =
  | 'includes'
  | 'notIncludes'
  | 'startsWith'
  | 'notStartsWith'
  | 'endsWith'
  | 'notEndsWith';

export type CompareWithDescriptorValueCheckMode =
  | CompareWithDescriptorAnyValueCheckMode
  | CompareWithDescriptorStringValueCheckMode;

export type CalculateByDescriptorValueCheckMode = 'regExp' | 'function';

export type CheckMode =
  | CheckActualValueCheckMode
  | CompareWithDescriptorValueCheckMode
  | CalculateByDescriptorValueCheckMode;

export type PlainEntityCheckMode = Exclude<
  CheckMode,
  CompareWithDescriptorStringValueCheckMode | Extract<CalculateByDescriptorValueCheckMode, 'regExp'>
>;

export interface EntityDescriptor {
  checkMode: CheckMode;
  value?: any;
  oneOf?: boolean;
}

export type CheckFunction = <ActualValue = any, DescriptorValue = any>(
  checkMode: CheckMode,
  actualValue: ActualValue,
  descriptorValue?: DescriptorValue
) => boolean;
