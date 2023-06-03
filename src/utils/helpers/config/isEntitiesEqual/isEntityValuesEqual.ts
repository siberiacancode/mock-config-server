import { flatten } from 'flat';

import type { CheckFunction, CheckMode } from '@/utils/types';

import { isPlainObject } from '../../isPlainObject/isPlainObject';

export const checkFunction: CheckFunction = (checkMode, firstValue: any, secondValue?: any) => {
  const isFirstValueUndefined = typeof firstValue === 'undefined';

  if (checkMode === 'exists') return !isFirstValueUndefined;
  if (checkMode === 'notExists') return isFirstValueUndefined;
  if (isFirstValueUndefined) return false;

  // ✅ important:
  // cast values to string for ignore types of values
  const firstValueString = `${firstValue}`;

  if (checkMode === 'isBoolean') return firstValueString === 'true' || firstValueString === 'false';
  if (checkMode === 'isNumber') return /^-?[1-9]\d*(\.\d+)?$/.test(firstValueString) && !Number.isNaN(Number.parseFloat(firstValueString));
  if (checkMode === 'isString') return true;

  const isSecondValueUndefined = typeof secondValue === 'undefined';

  // ✅ important:
  // if second value is undefined, following comparisons does not make sense
  if (isSecondValueUndefined) return false;

  const secondValuesArray = Array.isArray(secondValue) ? secondValue : [secondValue];

  if (checkMode === 'regExp') return secondValuesArray.some((value: RegExp) => value.test(firstValueString));

  if (checkMode === 'equals') return secondValuesArray.some((value: any) => `${value}` === firstValueString);
  if (checkMode === 'notEquals') return secondValuesArray.every((value: any) => `${value}` !== firstValueString);

  if (checkMode === 'includes') return secondValuesArray.some((value: any) => firstValueString.includes(`${value}`));
  if (checkMode === 'notIncludes') return secondValuesArray.every((value: any) => !firstValueString.includes(`${value}`));

  if (checkMode === 'startsWith') return secondValuesArray.some((value: any) => firstValueString.startsWith(`${value}`));
  if (checkMode === 'notStartsWith') return secondValuesArray.every((value: any) => !firstValueString.startsWith(`${value}`));

  if (checkMode === 'endsWith') return secondValuesArray.some((value: any) => firstValueString.endsWith(`${value}`));
  if (checkMode === 'notEndsWith') return secondValuesArray.every((value: any) => !firstValueString.endsWith(`${value}`));

  throw new Error('Wrong checkMode');
};

export const isEntityValuesEqual = (checkMode: CheckMode, firstEntityValue: any, secondEntityValue?: any) => {
  if (checkMode === 'function') return secondEntityValue(firstEntityValue, checkFunction);

  const isValuesArePlainObjects = isPlainObject(firstEntityValue) && isPlainObject(secondEntityValue);
  if (isValuesArePlainObjects) {
    const flattenFirstEntityValue = flatten<any, any>(firstEntityValue);
    const flattenSecondEntityValue = flatten<any, any>(secondEntityValue);
    return Object.keys(flattenSecondEntityValue).every((key) =>
      checkFunction(checkMode, flattenFirstEntityValue[key], flattenSecondEntityValue[key]));
  }

  const isValuesAreArrays = Array.isArray(firstEntityValue) && Array.isArray(secondEntityValue);
  if (isValuesAreArrays) {
    const flattenFirstEntityValue = flatten<any, any>(firstEntityValue);
    const flattenSecondEntityValue = flatten<any, any>(secondEntityValue);
    return (
      Object.keys(flattenFirstEntityValue).length ===
        Object.keys(flattenSecondEntityValue).length &&
      Object.keys(flattenFirstEntityValue).every(
        (key) =>
          checkFunction(checkMode, flattenFirstEntityValue[key], flattenSecondEntityValue[key]))
    )
  }

  return checkFunction(checkMode, firstEntityValue, secondEntityValue);
};
