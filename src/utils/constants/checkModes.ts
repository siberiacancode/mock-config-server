import type { CalculateByExpectedValueCheckMode, CheckMode, CompareWithExpectedValueCheckMode, CheckActualValueCheckMode } from '@/utils/types';

export const CHECK_ACTUAL_VALUE_CHECK_MODES: CheckActualValueCheckMode[] = [
  'exists',
  'notExists'
];

export const COMPARE_WITH_EXPECTED_VALUE_CHECK_MODES: CompareWithExpectedValueCheckMode[] = [
  'equals',
  'notEquals',
  'includes',
  'notIncludes',
  'startsWith',
  'notStartsWith',
  'endsWith',
  'notEndsWith'
];

export const CALCULATE_BY_EXPECTED_VALUE_CHECK_MODES: CalculateByExpectedValueCheckMode[] = [
  'regExp',
  'function'
];

export const ALLOWED_CHECK_MODES: CheckMode[] = [
  ...CHECK_ACTUAL_VALUE_CHECK_MODES,
  ...COMPARE_WITH_EXPECTED_VALUE_CHECK_MODES,
  ...CALCULATE_BY_EXPECTED_VALUE_CHECK_MODES
];
