import {
  CHECK_ACTUAL_VALUE_CHECK_MODES,
  COMPARE_WITH_DESCRIPTOR_VALUE_CHECK_MODES
} from '@/utils/constants';
import type { CheckActualValueCheckMode, CompareWithDescriptorValueCheckMode } from '@/utils/types';

export const isDescriptorValueValid = (
  checkMode: unknown,
  value: unknown,
  entityName?: unknown
) => {
  if (CHECK_ACTUAL_VALUE_CHECK_MODES.includes(checkMode as CheckActualValueCheckMode))
    return typeof value === 'undefined';

  if (
    COMPARE_WITH_DESCRIPTOR_VALUE_CHECK_MODES.includes(
      checkMode as CompareWithDescriptorValueCheckMode
    )
  ) {
    if (entityName === 'body' || entityName === 'variables') {
      return (
        typeof value === 'object' &&
        value !== null &&
        typeof value !== 'function' &&
        !(value instanceof RegExp)
      );
    }
    return typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string';
  }

  if (checkMode === 'function') return typeof value === 'function';
  if (checkMode === 'regExp') return value instanceof RegExp;

  throw new Error('Invalid checkMode');
};
