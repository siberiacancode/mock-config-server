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
const isObjectValid = (objectOrPrimitive: unknown): boolean => {
  if (
    typeof objectOrPrimitive === 'boolean' ||
    typeof objectOrPrimitive === 'number' ||
    typeof objectOrPrimitive === 'string' ||
    objectOrPrimitive === null
  ) {
    return true;
  }

  if (Array.isArray(objectOrPrimitive)) {
    return objectOrPrimitive.every(isObjectValid);
  }

  if (isPlainObject(objectOrPrimitive)) {
    for (const key in objectOrPrimitive) {
      if (!isObjectValid(objectOrPrimitive[key])) {
        return false;
      }
    }
    return true;
  }

  return false;
};

export const isDescriptorValueValid = (
  checkMode: CheckMode,
  value: unknown,
  isCheckAsObject: boolean
) => {
  if (CHECK_ACTUAL_VALUE_CHECK_MODES.includes(checkMode as CheckActualValueCheckMode)) {
    return typeof value === 'undefined';
  }

  if (
    COMPARE_WITH_DESCRIPTOR_ANY_VALUE_CHECK_MODES.includes(
      checkMode as CompareWithDescriptorAnyValueCheckMode
    )
  ) {
    if (isCheckAsObject) {
      return (isPlainObject(value) || Array.isArray(value)) && isObjectValid(value);
    }

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

  if (checkMode === 'function') return typeof value === 'function';
  if (checkMode === 'regExp') return value instanceof RegExp;
};
