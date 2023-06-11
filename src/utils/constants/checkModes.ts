import type { CheckMode, CheckOneValueMode, CheckTwoValuesMode } from '@/utils/types';

export const ONE_VALUE_CHECK_MODES: CheckOneValueMode[] = [
  'exists',
  'notExists',
  'isBoolean',
  'isNumber',
  'isString'
]

export const TWO_VALUES_CHECK_MODES: CheckTwoValuesMode[] = [
  'equals',
  'notEquals',
  'includes',
  'notIncludes',
  'startsWith',
  'notStartsWith',
  'endsWith',
  'notEndsWith'
]

export const ALLOWED_CHECK_MODES: CheckMode[] = [
  ...ONE_VALUE_CHECK_MODES,
  ...TWO_VALUES_CHECK_MODES,
  'regExp',
  'function'
];
