import { CHECK_ACTUAL_VALUE_CHECK_MODES, CHECK_MODES } from '@/utils/constants';
import type { CheckActualValueCheckMode, CheckMode, EntityDescriptor } from '@/utils/types';

import { isPlainObject } from '../../isPlainObject/isPlainObject';

const isValidCheckMode = (value: any): value is CheckMode => CHECK_MODES.includes(value);

const isCheckActualValueCheck = (value: any): value is CheckActualValueCheckMode =>
  CHECK_ACTUAL_VALUE_CHECK_MODES.includes(value);

export const isEntityDescriptor = (value: any): value is EntityDescriptor => {
  if (!isPlainObject(value)) return false;

  const isCheckModePropValid = 'checkMode' in value && isValidCheckMode(value.checkMode);
  if (!isCheckModePropValid) return false;

  const isCheckActualValueCheckMode = isCheckActualValueCheck(value.checkMode);
  const isValueHaveValueProp = 'value' in value;
  const isValuePropValid =
    (isCheckActualValueCheckMode && !isValueHaveValueProp) ||
    (!isCheckActualValueCheckMode && isValueHaveValueProp);
  if (!isValuePropValid) return false;

  return true;
};
