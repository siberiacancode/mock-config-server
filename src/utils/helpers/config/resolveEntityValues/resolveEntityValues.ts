import { flatten } from 'flat';

import type { CheckFunction, CheckMode } from '@/utils/types';

import { isPlainObject } from '../../isPlainObject/isPlainObject';
import { isPrimitive } from '../../isPrimitive/isPrimitive';

const NEGATIVE_CHECK_MODES: CheckMode[] = [
  'notExists',
  'notEquals',
  'notIncludes',
  'notStartsWith',
  'notEndsWith'
];

export const checkFunction: CheckFunction = (checkMode, actualValue, descriptorValue?): boolean => {
  if (checkMode === 'function' && typeof descriptorValue === 'function') return descriptorValue(actualValue, checkFunction);
  if (checkMode === 'regExp' && (descriptorValue instanceof RegExp)) return descriptorValue.test(actualValue as string);

  const isActualValueUndefined = typeof actualValue === 'undefined';

  if (checkMode === 'exists') return !isActualValueUndefined;
  if (checkMode === 'notExists') return isActualValueUndefined;

  // ✅ important:
  // cast values to string for ignore types of values
  const actualValueString = String(actualValue);
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

export const resolveEntityValues = (checkMode: CheckMode, actualValue: any, descriptorValue?: any) => {
  if (checkMode === 'function') return descriptorValue(actualValue, checkFunction);
  if (checkMode === 'exists' || checkMode === 'notExists') return checkFunction(checkMode, actualValue, descriptorValue);

  const isActualValuePrimitive = isPrimitive(actualValue);
  const isActualValueArray =  Array.isArray(actualValue);
  const isActualValueObject = isPlainObject(actualValue);

  const isDescriptorValuePrimitive =  isPrimitive(descriptorValue);
  const isDescriptorValueArray = Array.isArray(descriptorValue);
  const isDescriptorValueObject = isPlainObject(descriptorValue);

  const isNegativeCheckMode = NEGATIVE_CHECK_MODES.includes(checkMode);

  // ✅ primitive-primitive
  if (isActualValuePrimitive && isDescriptorValuePrimitive) return checkFunction(checkMode, actualValue, descriptorValue);

  // ✅ primitive-array
  if (isActualValuePrimitive && isDescriptorValueArray) {
    if (isNegativeCheckMode) {
      return descriptorValue.every((descriptorValueElement) => checkFunction(checkMode, actualValue, descriptorValueElement))
    }
    return descriptorValue.some((descriptorValueElement) => checkFunction(checkMode, actualValue, descriptorValueElement))
  }

  // ✅ primitive-object
  if (isActualValuePrimitive && isDescriptorValueObject) {
    if (checkMode === 'regExp') return checkFunction(checkMode, actualValue, descriptorValue);
    return isNegativeCheckMode;
  }

  // ✅ array-primitive
  if (isActualValueArray && isDescriptorValuePrimitive) {
    if (isNegativeCheckMode) {
      return actualValue.every((actualValueElement) => checkFunction(checkMode, actualValueElement, descriptorValue))
    }
    return actualValue.some((actualValueElement) => checkFunction(checkMode, actualValueElement, descriptorValue))
  }

  // ✅ array-array
  if (isActualValueArray && isDescriptorValueArray) {
    if (checkMode === 'regExp') return descriptorValue.every((descriptorValueElement, index) => checkFunction(checkMode, actualValue[index], descriptorValueElement));
    const flattenActualValue = flatten<any, any>(actualValue);
    const flattenDescriptorValue = flatten<any, any>(descriptorValue);

    if (Object.keys(flattenActualValue).length === Object.keys(flattenDescriptorValue).length) return Object.keys(flattenDescriptorValue).every((flattenDescriptorValueKey) => checkFunction(checkMode, flattenActualValue[flattenDescriptorValueKey], flattenDescriptorValue[flattenDescriptorValueKey]));
    return isNegativeCheckMode;
  }

  // ✅ array-object
  if (isActualValueArray && isDescriptorValueObject) {
    if (checkMode === 'regExp') return actualValue.some((actualValueElement) => checkFunction(checkMode, actualValueElement, descriptorValue));

    const flattenDescriptorValue = flatten<any, any>(descriptorValue);

    if (isNegativeCheckMode) {
      return actualValue.every((actualValueElement) => {
        const flattenActualValue = flatten<any, any>(actualValueElement);
        return Object.keys(flattenDescriptorValue).every((flattenDescriptorValueKey) => checkFunction(checkMode, flattenActualValue[flattenDescriptorValueKey], flattenDescriptorValue[flattenDescriptorValueKey]))
      });
    }
    return actualValue.some((actualValueElement) => {
      const flattenActualValue = flatten<any, any>(actualValueElement);
      return Object.keys(flattenDescriptorValue).every((flattenDescriptorValueKey) => checkFunction(checkMode, flattenActualValue[flattenDescriptorValueKey], flattenDescriptorValue[flattenDescriptorValueKey]))
    })
  }

  // ✅ object-primitive
  if (isActualValueObject && isDescriptorValuePrimitive) return isNegativeCheckMode;

  // ✅ object-array
  if (isActualValueObject && isDescriptorValueArray) {
    if (checkMode === 'regExp') return descriptorValue.some((descriptorValueElement) => checkFunction(checkMode, actualValue, descriptorValueElement));
    const flattenActualValue = flatten<any, any>(actualValue);

    if (isNegativeCheckMode) {
      return descriptorValue.every((descriptorValueElement) => {
        const flattenDescriptorValue = flatten<any, any>(descriptorValueElement);
        return Object.keys(flattenActualValue).every((flattenActualValueKey) => checkFunction(checkMode, flattenActualValue[flattenActualValueKey], flattenDescriptorValue[flattenActualValueKey]));
      })
    }
    return descriptorValue.some((descriptorValueElement) => {
      const flattenDescriptorValue = flatten<any, any>(descriptorValueElement);
      return Object.keys(flattenActualValue).every((flattenActualValueKey) => checkFunction(checkMode, flattenActualValue[flattenActualValueKey], flattenDescriptorValue[flattenActualValueKey]));
    })
  }

  // ✅ object-object
  if (isActualValueObject && isDescriptorValueObject) {
    if (checkMode === 'regExp') return checkFunction(checkMode, actualValue, descriptorValue);
    const flattenActualValue = flatten<any, any>(actualValue);
    const flattenDescriptorValue = flatten<any, any>(descriptorValue);

    if (isNegativeCheckMode) {
      return Object.keys(flattenDescriptorValue).some((flattenDescriptorValueKey) => checkFunction(checkMode, flattenActualValue[flattenDescriptorValueKey], flattenDescriptorValue[flattenDescriptorValueKey]));
    }
    return Object.keys(flattenDescriptorValue).every((flattenDescriptorValueKey) => checkFunction(checkMode, flattenActualValue[flattenDescriptorValueKey], flattenDescriptorValue[flattenDescriptorValueKey]));
  }
};
