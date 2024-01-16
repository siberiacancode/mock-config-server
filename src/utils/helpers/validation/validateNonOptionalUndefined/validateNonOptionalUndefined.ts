import { z } from 'zod';

import type { PlainObject } from '@/utils/types';

import { isPlainObject } from '../../isPlainObject/isPlainObject';

export const validateNonOptionalUndefined = <T extends PlainObject>(
  schema: z.ZodType<T>,
  keys: (keyof T)[]
) => {
  return z
    .custom(
      (value) =>
        isPlainObject(value) &&
        keys.every((key) => Object.prototype.hasOwnProperty.call(value, key))
    )
    .pipe(schema);
};
