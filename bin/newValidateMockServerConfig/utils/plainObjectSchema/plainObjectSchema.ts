import { z } from 'zod';

import { isPlainObject } from '@/utils/helpers';
import type { PlainObject } from '@/utils/types';

export const plainObjectSchema = <T extends PlainObject>(
  schema: z.ZodType<T>,
  requiredProperties?: (keyof T)[]
) => {
  return z
    .custom(
      (value) =>
        isPlainObject(value) &&
        (requiredProperties ?? []).every((property) =>
          Object.prototype.hasOwnProperty.call(value, property)
        )
    )
    .pipe(schema);
};
