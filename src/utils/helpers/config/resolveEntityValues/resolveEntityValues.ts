import { flatten } from 'flat';

import { NEGATION_CHECK_MODES } from '@/utils/constants';
import type { CheckFunction, CheckMode } from '@/utils/types';

import { isPlainObject } from '../../isPlainObject/isPlainObject';
import { isPrimitive } from '../../isPrimitive/isPrimitive';
import { isRegExp } from '../../isRegExp/isRegExp';

const checkFunction: CheckFunction = (checkMode, actualValue, descriptorValue?): boolean => {
  if (checkMode === 'function' && typeof descriptorValue === 'function')
    return descriptorValue(actualValue, checkFunction);

  const actualValueString = String(actualValue);

  if (checkMode === 'regExp' && isRegExp(descriptorValue))
    return descriptorValue.test(actualValueString);

  const isActualValueUndefined = typeof actualValue === 'undefined';

  if (checkMode === 'exists') return !isActualValueUndefined;
  if (checkMode === 'notExists') return isActualValueUndefined;

  // ✅ important:
  // cast values to string for ignore types of values
  const descriptorValueString = String(descriptorValue);

  if (checkMode === 'equals') return actualValueString === descriptorValueString;
  if (checkMode === 'notEquals') return actualValueString !== descriptorValueString;

  if (checkMode === 'includes') return actualValueString.includes(descriptorValueString);
  if (checkMode === 'notIncludes') return !actualValueString.includes(descriptorValueString);

  if (checkMode === 'startsWith') return actualValueString.startsWith(descriptorValueString);
  if (checkMode === 'notStartsWith') return !actualValueString.startsWith(descriptorValueString);

  if (checkMode === 'endsWith') return actualValueString.endsWith(descriptorValueString);
  if (checkMode === 'notEndsWith') return !actualValueString.endsWith(descriptorValueString);

  throw new Error('Wrong checkMode');
};

export const resolveEntityValues = (
  checkMode: CheckMode,
  actualValue: any,
  descriptorValue?: any
) => {
  if (checkMode === 'function') return descriptorValue(actualValue, checkFunction);
  if (checkMode === 'exists' || checkMode === 'notExists')
    return checkFunction(checkMode, actualValue, descriptorValue);

  // ✅ actual: primitive, descriptor: primitive
  const isActualValuePrimitive = isPrimitive(actualValue);
  const isDescriptorValuePrimitive = isPrimitive(descriptorValue);
  if (isActualValuePrimitive && isDescriptorValuePrimitive)
    return checkFunction(checkMode, actualValue, descriptorValue);

  // ✅ actual: primitive, descriptor: array
  const isDescriptorValueArray = Array.isArray(descriptorValue);
  const isNegativeCheckMode = NEGATION_CHECK_MODES.includes(
    checkMode as (typeof NEGATION_CHECK_MODES)[number]
  );
  if (isActualValuePrimitive && isDescriptorValueArray) {
    if (isNegativeCheckMode) {
      return descriptorValue.every((descriptorValueElement) =>
        checkFunction(checkMode, actualValue, descriptorValueElement)
      );
    }
    return descriptorValue.some((descriptorValueElement) =>
      checkFunction(checkMode, actualValue, descriptorValueElement)
    );
  }

  // ✅ actual: primitive, descriptor: object => skip
  const isDescriptorValueObject = isPlainObject(descriptorValue) || isRegExp(descriptorValue);
  if (isActualValuePrimitive && isDescriptorValueObject) {
    if (checkMode === 'regExp') return checkFunction(checkMode, actualValue, descriptorValue);
    // ✅ important: resolving primitive with object make no sense
    return isNegativeCheckMode;
  }

  // ✅ actual: array, descriptor: primitive => skip
  const isActualValueArray = Array.isArray(actualValue);
  // ✅ important: resolving array with primitive make no sense
  if (isActualValueArray && isDescriptorValuePrimitive) return isNegativeCheckMode;

  // ✅ actual: array, descriptor: array
  if (isActualValueArray && isDescriptorValueArray) {
    if (actualValue.length !== descriptorValue.length) return isNegativeCheckMode;
    const flattenActualValue = flatten<any, any>(actualValue);
    const flattenDescriptorValue = flatten<any, any>(descriptorValue);

    if (Object.keys(flattenActualValue).length === Object.keys(flattenDescriptorValue).length)
      return Object.keys(flattenDescriptorValue).every((flattenDescriptorValueKey) =>
        checkFunction(
          checkMode,
          flattenActualValue[flattenDescriptorValueKey],
          flattenDescriptorValue[flattenDescriptorValueKey]
        )
      );
    return isNegativeCheckMode;
  }

  // ✅ actual: array, descriptor: object => skip
  if (isActualValueArray && isDescriptorValueObject) {
    if (checkMode === 'regExp')
      return actualValue.some((actualValueElement) =>
        checkFunction(checkMode, actualValueElement, descriptorValue)
      );
    // ✅ important: resolving array with object make no sense
    return isNegativeCheckMode;
  }

  // ✅ actual: object, descriptor: primitive => skip
  const isActualValueObject = isPlainObject(actualValue);
  // ✅ important: resolving object with primitive make no sense
  if (isActualValueObject && isDescriptorValuePrimitive) return isNegativeCheckMode;

  // ✅ actual: object, descriptor: array
  if (isActualValueObject && isDescriptorValueArray) {
    // ✅ important: any object can not pass RegExp check
    if (checkMode === 'regExp') return false;
    const flattenActualValue = flatten<any, any>(actualValue);

    if (isNegativeCheckMode) {
      return descriptorValue.every((descriptorValueElement) => {
        const flattenDescriptorValue = flatten<any, any>(descriptorValueElement);
        if (Object.keys(flattenActualValue).length !== Object.keys(flattenDescriptorValue).length)
          return isNegativeCheckMode;
        return Object.keys(flattenActualValue).every((flattenActualValueKey) =>
          checkFunction(
            checkMode,
            flattenActualValue[flattenActualValueKey],
            flattenDescriptorValue[flattenActualValueKey]
          )
        );
      });
    }
    return descriptorValue.some((descriptorValueElement) => {
      const flattenDescriptorValue = flatten<any, any>(descriptorValueElement);
      if (Object.keys(flattenActualValue).length !== Object.keys(flattenDescriptorValue).length)
        return isNegativeCheckMode;
      return Object.keys(flattenActualValue).every((flattenActualValueKey) =>
        checkFunction(
          checkMode,
          flattenActualValue[flattenActualValueKey],
          flattenDescriptorValue[flattenActualValueKey]
        )
      );
    });
  }

  // ✅ actual: object, descriptor: object
  if (isActualValueObject && isDescriptorValueObject) {
    // ✅ important: any object can not pass RegExp check
    if (checkMode === 'regExp') return false;
    const flattenActualValue = flatten<any, any>(actualValue);
    const flattenDescriptorValue = flatten<any, any>(descriptorValue);

    if (Object.keys(flattenActualValue).length !== Object.keys(flattenDescriptorValue).length)
      return isNegativeCheckMode;

    if (isNegativeCheckMode) {
      return Object.keys(flattenDescriptorValue).some((flattenDescriptorValueKey) =>
        checkFunction(
          checkMode,
          flattenActualValue[flattenDescriptorValueKey],
          flattenDescriptorValue[flattenDescriptorValueKey]
        )
      );
    }
    return Object.keys(flattenDescriptorValue).every((flattenDescriptorValueKey) =>
      checkFunction(
        checkMode,
        flattenActualValue[flattenDescriptorValueKey],
        flattenDescriptorValue[flattenDescriptorValueKey]
      )
    );
  }
};
