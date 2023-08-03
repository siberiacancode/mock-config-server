import type {
  CalculateByDescriptorValueCheckMode,
  CheckMode,
  CompareWithDescriptorValueCheckMode,
  CheckActualValueCheckMode,
  CompareWithDescriptorAnyValueCheckMode,
  CompareWithDescriptorStringValueCheckMode
} from '@/utils/types';

export const CHECK_ACTUAL_VALUE_CHECK_MODES: CheckActualValueCheckMode[] = ['exists', 'notExists'];

export const COMPARE_WITH_DESCRIPTOR_ANY_VALUE_CHECK_MODES: CompareWithDescriptorAnyValueCheckMode[] =
  ['equals', 'notEquals'];

export const COMPARE_WITH_DESCRIPTOR_STRING_VALUE_CHECK_MODES: CompareWithDescriptorStringValueCheckMode[] =
  ['includes', 'notIncludes', 'startsWith', 'notStartsWith', 'endsWith', 'notEndsWith'];

export const COMPARE_WITH_DESCRIPTOR_VALUE_CHECK_MODES: CompareWithDescriptorValueCheckMode[] = [
  ...COMPARE_WITH_DESCRIPTOR_ANY_VALUE_CHECK_MODES,
  ...COMPARE_WITH_DESCRIPTOR_STRING_VALUE_CHECK_MODES
];

export const CALCULATE_BY_DESCRIPTOR_VALUE_CHECK_MODES: CalculateByDescriptorValueCheckMode[] = [
  'regExp',
  'function'
];

export const CHECK_MODES: CheckMode[] = [
  ...CHECK_ACTUAL_VALUE_CHECK_MODES,
  ...COMPARE_WITH_DESCRIPTOR_VALUE_CHECK_MODES,
  ...CALCULATE_BY_DESCRIPTOR_VALUE_CHECK_MODES
];

export const PLAIN_ENTITY_CHECK_MODES: CheckMode[] = [
  ...CHECK_ACTUAL_VALUE_CHECK_MODES,
  ...COMPARE_WITH_DESCRIPTOR_ANY_VALUE_CHECK_MODES,
  'function'
];

export const NEGATION_CHECK_MODES: CheckMode[] = [
  'notExists',
  'notEquals',
  'notIncludes',
  'notStartsWith',
  'notEndsWith'
];
