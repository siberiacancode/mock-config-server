import { z } from 'zod';

import type { Comparator } from '@/utils/types';

import { isComparator } from '@/utils/helpers';

import { plainObjectSchema } from '../../utils';

export const rawRouteConfigSchema = z.strictObject({
  data: z.function(),
  entities: plainObjectSchema(
    z.strictObject({
      isBinary: z.union([z.boolean(), z.custom<Comparator>(isComparator)]).optional(),
      raw: z.function().optional()
    })
  ).optional()
});
