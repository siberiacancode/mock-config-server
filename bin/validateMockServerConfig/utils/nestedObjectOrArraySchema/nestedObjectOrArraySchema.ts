import { z } from 'zod';

import { isPlainObject } from '@/utils/helpers';
import type { NestedObjectOrArray } from '@/utils/types';

export const nestedObjectOrArraySchema = <T>(
  valueSchema: z.ZodType<T>
): z.ZodType<NestedObjectOrArray<T>> => {
  const nextNestingLevelValueSchema = z.union([
    z.lazy(() => nestedObjectOrArraySchema(valueSchema)),
    valueSchema
  ]);

  return z.union([
    z.array(nextNestingLevelValueSchema),
    z.record(nextNestingLevelValueSchema).and(z.custom((value) => isPlainObject(value)))
  ]);
};
