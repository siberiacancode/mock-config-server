import { z } from 'zod';

import type { Comparator } from '@/utils/types';

import { isComparator } from '@/utils/helpers';

import { plainObjectSchema } from '../../utils';

export const rawRouteConfigSchema = z.strictObject({
  data: z.function(),
  entities: plainObjectSchema(
    z.strictObject({
      data: z.any().optional(),
      isBinary: z.union([z.boolean(), z.custom<Comparator>(isComparator)]).optional()
    })
  ).optional()
});
