import { flatten } from 'flat';

import { NEGATION_CHECK_MODES } from '@/utils/constants';
import type { CheckActualValueCheckMode, CheckFunction, CheckMode } from '@/utils/types';

import { isPlainObject } from '../../isPlainObject/isPlainObject';
import { isPrimitive } from '../../isPrimitive/isPrimitive';

const checkFunction: CheckFunction = (checkMode, actualValue, descriptorValue?) => {
  const isActualValueUndefined = typeof actualValue === 'undefined';
  if (checkMode === 'exists') return !isActualValueUndefined;
  if (checkMode === 'notExists') return isActualValueUndefined;

  if (checkMode === 'function' && typeof descriptorValue === 'function')
    return !!descriptorValue(actualValue, checkFunction);

  const actualValueString = String(actualValue);

  // ✅ important:
  // recreate RegExp because 'g' flag can be cause of unexpected result
  if (checkMode === 'regExp' && descriptorValue instanceof RegExp)
    return new RegExp(descriptorValue).test(actualValueString);

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

const compareEntityValues = (checkMode: CheckMode, actualValue: any, descriptorValue?: any) => {
  if (checkMode === 'exists' || checkMode === 'notExists') {
    return checkFunction(checkMode, actualValue);
  }

  if (checkMode === 'regExp') {
    return checkFunction(checkMode, actualValue, descriptorValue);
  }

  if (checkMode === 'function') {
    return !!descriptorValue(actualValue, checkFunction);
  }

  const isActualValuePrimitive = isPrimitive(actualValue);
  const isDescriptorValuePrimitive = isPrimitive(descriptorValue);
  if (isActualValuePrimitive && isDescriptorValuePrimitive) {
    return checkFunction(checkMode, actualValue, descriptorValue);
  }

  const isActualValueObject = isPlainObject(actualValue) || Array.isArray(actualValue);
  const isDescriptorValueObject = isPlainObject(descriptorValue) || Array.isArray(descriptorValue);
  const isNegationCheckMode = NEGATION_CHECK_MODES.includes(
    checkMode as (typeof NEGATION_CHECK_MODES)[number]
  );
  if (isActualValueObject && isDescriptorValueObject) {
    const flattenActualValue = flatten<any, any>(actualValue);
    const flattenDescriptorValue = flatten<any, any>(descriptorValue);

    if (Object.keys(flattenActualValue).length !== Object.keys(flattenDescriptorValue).length) {
      return isNegationCheckMode;
    }

    return Object.keys(flattenDescriptorValue)[isNegationCheckMode ? 'some' : 'every'](
      (flattenDescriptorValueKey) =>
        checkFunction(
          checkMode,
          flattenActualValue[flattenDescriptorValueKey],
          flattenDescriptorValue[flattenDescriptorValueKey]
        )
    );
  }

  return isNegationCheckMode;
};

interface ResolveEntityParamsWithCheckActualValueCheckMode {
  checkMode: CheckActualValueCheckMode;
  actualValue: any;
}

interface ResolveEntityParamsWithEnabledOneOf {
  checkMode: Exclude<CheckMode, CheckActualValueCheckMode>;
  actualValue: any;
  descriptorValue: any[];
  oneOf: true;
}

interface ResolveEntityParamsWithDisabledOneOf {
  checkMode: Exclude<CheckMode, CheckActualValueCheckMode>;
  actualValue: any;
  descriptorValue: any;
  oneOf?: false;
}

type ResolveEntityParams =
  | ResolveEntityParamsWithCheckActualValueCheckMode
  | ResolveEntityParamsWithEnabledOneOf
  | ResolveEntityParamsWithDisabledOneOf;

export const resolveEntityValues = (params: ResolveEntityParams) => {
  const { checkMode, actualValue } = params;
  if (checkMode === 'exists' || checkMode === 'notExists') {
    return compareEntityValues(checkMode, actualValue);
  }

  const { oneOf, descriptorValue } = params as Exclude<
    ResolveEntityParams,
    ResolveEntityParamsWithCheckActualValueCheckMode
  >;

  if (!oneOf) {
    return compareEntityValues(checkMode, actualValue, descriptorValue);
  }

  return descriptorValue.some((descriptorValueElement) =>
    compareEntityValues(checkMode, actualValue, descriptorValueElement)
  );
};
