import {
  CHECK_ACTUAL_VALUE_CHECK_MODES,
  COMPARE_WITH_DESCRIPTOR_ANY_VALUE_CHECK_MODES,
  COMPARE_WITH_DESCRIPTOR_STRING_VALUE_CHECK_MODES
} from '@/utils/constants';
import { isPlainObject } from '@/utils/helpers';
import type {
  CheckActualValueCheckMode,
  CheckMode,
  CompareWithDescriptorAnyValueCheckMode,
  CompareWithDescriptorStringValueCheckMode
} from '@/utils/types';

// ✅ important:
// should validate all properties over nesting
const isObjectOrArrayValid = (value: unknown): boolean => {
  if (
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string' ||
    value === null
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isObjectOrArrayValid);
  }

  if (isPlainObject(value)) {
    for (const key in value) {
      if (!isObjectOrArrayValid(value[key])) {
        return false;
      }
    }
    return true;
  }

  return false;
};

export const isDescriptorValueValid = (checkMode: CheckMode, value: unknown) => {
  if (CHECK_ACTUAL_VALUE_CHECK_MODES.includes(checkMode as CheckActualValueCheckMode)) {
    return typeof value === 'undefined';
  }

  if (
    COMPARE_WITH_DESCRIPTOR_ANY_VALUE_CHECK_MODES.includes(
      checkMode as CompareWithDescriptorAnyValueCheckMode
    )
  ) {
    const isValueObjectOrArray = isPlainObject(value) || Array.isArray(value);
    if (isValueObjectOrArray) return isObjectOrArrayValid(value);

    return (
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      typeof value === 'string' ||
      value === null
    );
  }

  if (
    COMPARE_WITH_DESCRIPTOR_STRING_VALUE_CHECK_MODES.includes(
      checkMode as CompareWithDescriptorStringValueCheckMode
    )
  ) {
    return typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string';
  }

  if (checkMode === 'function') return typeof value === 'function' && value.length <= 2;
  if (checkMode === 'regExp') return value instanceof RegExp;
};
