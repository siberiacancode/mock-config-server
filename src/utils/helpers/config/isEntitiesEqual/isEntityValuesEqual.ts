import { flatten } from 'flat';

import { isPlainObject } from '../../isPlainObject/isPlainObject';

export const isEntityValuesEqual = (firstEntityValue: any, secondEntityValue: any) => {
  const isValuesArePlainObjects =
    isPlainObject(firstEntityValue) && isPlainObject(secondEntityValue);
  if (isValuesArePlainObjects) {
    const flattenFirstEntityValue = flatten<any, any>(firstEntityValue);
    const flattenSecondEntityValue = flatten<any, any>(secondEntityValue);

    return Object.keys(flattenFirstEntityValue).every(
      (key) =>
        // ✅ important:
        // call 'toString' for ignore types of values
        flattenFirstEntityValue[key].toString() === flattenSecondEntityValue[key]?.toString()
    );
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
          // ✅ important:
          // call 'toString' for ignore types of values
          flattenFirstEntityValue[key].toString() === flattenSecondEntityValue[key].toString()
      )
    );
  }

  return `${firstEntityValue}` === `${secondEntityValue}`;
};
